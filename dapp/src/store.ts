import { BeaconWallet } from '@taquito/beacon-wallet';
import { BeaconEvent, NetworkType } from '@airgap/beacon-sdk';
import { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { encodeKey } from '@taquito/utils';
import { verifyCredential } from 'didkit-wasm';
import { addDefaults, claimFromEntry, claimTypeFromVC } from './helpers/index';
import type { ClaimMap, Claim } from './helpers'
import { Entry, makeControlClient, makeViewClient, viewerOpts } from '@spruceid/tzprofiles/dist/lib';
import type { ControlClient, ViewClient } from '@spruceid/tzprofiles/dist/lib';
import type { Content, Hash, Ref } from '@spruceid/tzprofiles/dist/rebase/storage';

/*
 * Global Variables
 */

// Global Constants
// The kepler server hostname
export const keplerDomain = process.env.KEPLER_URL;
// The witness worker hostname
export const witnessUrl = process.env.WITNESS_URL;
// The explainer server hostname
export const explainerInstance = process.env.EXPLAINER_URL;

// Global variables used in the store with the writable API
// UserData from a beacon wallet
export const userData = writable(null);

// The contract address associated with a logged in wallet
export const contractAddress: Writable<string> = writable<string>(null);

// The address entered by an end user in the search bar
export const searchAddress: Writable<string> = writable<string>(null);

// Is the contract being loaded?
export const loadingContracts: Writable<boolean> = writable(true);

export const rebaseControlClient: Writable<ControlClient> = writable(null);

let localControlClient: ControlClient;
rebaseControlClient.subscribe((x) => {
  localControlClient = x;
});

// The end user's wallet
export const wallet: Writable<BeaconWallet> = writable<BeaconWallet>(null);

// Enum representation of the Tezos blockchain used
export const network: Writable<NetworkType> = writable<NetworkType>(
  NetworkType.MAINNET
);

// TODO: Import Tezos network instead of just matching it.
let localNetwork: NetworkType = NetworkType.MAINNET;

network.subscribe((next) => {
  localNetwork = next;
});

// The UI element for poping toast-like alerts
export const alert: Writable<{
  message: string;
  variant: 'error' | 'warning' | 'success' | 'info';
}> = writable<{
  message: string;
  variant: 'error' | 'warning' | 'success' | 'info';
}>(null);

/*
 * Claims Interactions
 */

export let claimsStream: Writable<ClaimMap> =
  writable<ClaimMap>(addDefaults({}));
let localClaimsStream: ClaimMap;

export let viewerInstance: string = 'http://127.0.0.1:9090';

claimsStream.subscribe((x) => {
  localClaimsStream = x;
});


export const originate = async (): Promise<void> => {
  if (!localControlClient) {
    throw new Error('No Rebase Control Client detected');
  }

  let claimsList: Array<Content> = Object.values(localClaimsStream)
    .map((c) => {
      return c.preparedContent
    })
    .filter((x) => x && typeof x === 'object')
    .map((x) => x as Content);

  if (claimsList.length < 1) {
    alert.set({
      message: 'No claim urls found',
      variant: 'error',
    });
    throw new Error('No claim urls found');
  }

  // TODO: Restore the generation of the Contract Address.
  // TODO: Handle >1 Contract Addresses?
  await localControlClient.originateContent(claimsList);
};

export const addClaims = async (
  claimsList: Array<Claim>
): Promise<void> => {
  if (!localControlClient) {
    throw new Error('No rebase client detected');
  }

  let prepContentList = claimsList.map((x) => {
    return x.preparedContent
  });

  let contentList = prepContentList
  .filter((x) => !!x && typeof x === 'object')
  .map((x) => x as Content)

  await localControlClient.create(contentList);
  return
};

export const removeClaims = async (
  claimsList: Array<Claim>
): Promise<void> => {
  if (!localControlClient) {
    throw new Error('No rebase client detected');
  }

  let filtered = claimsList.filter((x) => {
    return x.content 
    && typeof x.content === 'object' 
    && x.irl 
    && typeof x.irl === 'string'
  });

  let storage = await Promise.all(
    filtered.map(async (x) => {
      return [await localControlClient.hasher(x.content as Content), x.irl]
    })
  ) as Array<[Hash, Ref]>;

  await localControlClient.remove(storage);
};

wallet.subscribe((w) => {
  if (w) {
    w.client.subscribeToEvent(
      BeaconEvent.PERMISSION_REQUEST_SUCCESS,
      async (data) => {
        const pk = data.account.publicKey;
        const pkh = data.account.address;
        if (!pk.includes('pk')) {
          const prefix = { tz1: '00', tz2: '01', tz3: '02' };
          data.account.publicKey = encodeKey(prefix[pkh.substring(0, 3)] + pk);
        }
        userData.set(data);

        let rbOpts = {
          keplerDomain: keplerDomain,
          network: localNetwork,
          signer: w
        };

        let rbc = await makeControlClient(rbOpts);
        rebaseControlClient.set(rbc);
        loadingContracts.set(true);

        try {
          let result = await rbc.readOwn();
          if (result.length > 0) {
            // TODO: Add a way to handle multiple contracts?
            contractAddress.set(rbc.getAddr());

            let nextClaims = Object.assign({}, localClaimsStream);
            // TODO: Make sure contracts are ordered oldest to newest to prefer newer contracts.
            result.forEach((contentList) => {
              contentList.forEach((entry) => {
                if (entry.valid) {
                  let claimType = claimTypeFromVC(entry.content);
                  if (!claimType) {
                    console.error(
                      `Unknown claim type: ${
                        entry.content?.type?.length &&
                        entry.content.type[entry.content.type.length - 1]
                      }`
                    )
                    return
                  }

                  // NOTE: This overrides older claims.
                  nextClaims[claimType] = claimFromEntry(claimType, entry);
                }
                // TODO: Something with invalid entries?
              })
            })

            nextClaims = addDefaults(nextClaims);

            claimsStream.set(nextClaims);
          } else {
            alert.set({
              message: 'No contract detected, starting new one',
              variant: 'info',
            });
            console.warn('No contract detected, starting new one');
          }
        } catch (e) {
          alert.set({
            message: e.message || JSON.stringify(e),
            variant: 'error',
          });
          console.error('store::load_contracts::', e);
        } finally {
          loadingContracts.set(false);
        }
      }
    );
  }
});


export const initWallet: () => Promise<void> = async () => {
  const options = {
    name: 'Tezos Personal Profile',
    iconUrl: 'https://tezostaquito.io/img/favicon.png',
    preferredNetwork: localNetwork,
  };

  let rpcUrl = localNetwork === NetworkType.CUSTOM ? 
    'http://localhost:8732/' :
    `https://${localNetwork}.smartpy.io/`;

  // TODO: Make sure this is right
  const requestPermissionsInput = {
    network: {
      type:  localNetwork,
      rpcUrl,
      name: `${localNetwork}`,
    },
  };

  const newWallet = new BeaconWallet(options);

  try {
    wallet.set(newWallet);
    await newWallet.requestPermissions(requestPermissionsInput);
  } catch (e) {
    wallet.set(null);
    alert.set({
      message: e.message || JSON.stringify(e),
      variant: 'error',
    });

    throw e;
  }
};

// Viewer related params:
export let searchClaims: Writable<ClaimMap> = writable(addDefaults({}));

export interface searchRetryOpts {
  current: number;
  max: number;
  step: number;
}

export const defaultSearchOpts = {
  current: 0,
  max: 3000,
  step: 1000,
};

const searchRetry = async (
  addr: string,
  viewClient: ViewClient,
  opts: searchRetryOpts
): Promise<Array<Array<Entry>>> => {
  try {
    let vOpts = viewerOpts(localNetwork, addr);
    return await viewClient.read(vOpts);
  } catch (err) {
    if (opts.current >= opts.max) {
      console.warn(
        new Error(
          `Found contract, encountered repeated network errors, gave up on: ${err.message}`
        )
      );
      return;
    }
    opts.current += opts.step;

    let f = (): Promise<
      Array<Array<Entry>>
    > => {
      return new Promise((resolve, reject) => {
        let innerF = async () => {
          let found = await searchRetry(addr, viewClient, opts);
          resolve(found);
        };

        setTimeout(innerF, opts.current);
      });
    };

    let result = await f();

    return result;
  }
};

export const search = async (wallet: string, opts: searchRetryOpts) => {
  if (wallet) {
    try {
      let searchingAddress = wallet;

      searchClaims.set(addDefaults({}));

      let contractAddr = '';

      let viewClient = makeViewClient({
        searchAddress: contractAddr,
        keplerDomain,
        network: localNetwork
      });

      let found = await searchRetry(
        searchingAddress,
        viewClient,
        Object.assign({}, opts)
      );

      if (found) {
        let nextSearchClaims = addDefaults({});
        // TODO: Handle multiple address?
        searchAddress.set(contractAddr);
        found
        .forEach((contentList) => {
          contentList
            // NOTE: We are not dealing with invalid claims in the UI
            // TODO: Handle invalid claims
            .filter((entry) => entry.valid)
            .forEach((entry) => {
              let ct = claimTypeFromVC(entry.content);
              if (!ct) {
                throw new Error(
                  `No claim type found in vc: ${JSON.stringify(entry.content?.type)}`
                );
              }

              // NOTE: Overrides old entries,
              nextSearchClaims[ct] = claimFromEntry(ct, entry);
            });
        })
        

        searchClaims.set(nextSearchClaims);
        return;
      } else {
        alert.set({
          message: 'Profile not found',
          variant: 'error',
        });
        throw Error('Profile not found');
      }
    } catch (err) {
      alert.set({
        message: err.message || 'Network error',
        variant: 'error',
      });
      throw err;
    }
  }

  alert.set({
    message: `No contract found for ${wallet}`,
    variant: 'error',
  });
  throw new Error(`No contract found for ${wallet}`);
};
