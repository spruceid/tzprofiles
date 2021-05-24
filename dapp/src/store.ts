import {BeaconWallet} from '@taquito/beacon-wallet';
import type {Writable} from 'svelte/store';
import {writable} from 'svelte/store';
import {TezosToolkit} from '@taquito/taquito';
import {Tzip16Module} from '@taquito/tzip16';
import NetworkType from 'enums/NetworkType';
import BeaconEvent from 'enums/BeaconEvent';
import * as contractLib from 'tzprofiles';
import * as helpers from './helpers/index';

import {Kepler, authenticator, Action, getOrbitId} from 'kepler-sdk';
import {verifyCredential} from 'didkit-wasm';
import { addDefaults, claimFromTriple, claimTypeFromVC } from './helpers/index';

/*
* Global Variables
*/

// Global Constants
// The kepler server hostname
export const keplerInstance = process.env.KEPLER_URL;
// The witness worker hostname
export const witnessUrl = process.env.WITNESS_URL;

// Global variables used in the store with the writable API
// UserData from a beacon wallet
export const userData = writable(null);

// The contract address associated with a logged in wallet
export const contractAddress: Writable<string> = writable<string>(null);

// The address entered by an end user in the search bar
export const searchAddress: Writable<string> = writable<string>(null);

// The contract address associated with a logged in wallet
export const contractAddress: Writable<string> = writable<string>(null);

// Is the contract being loaded?
export const loadingContracts: Writable<boolean> = writable(true);

// The end user's wallet
export const wallet: Writable<BeaconWallet> = writable<BeaconWallet>(null);
// TODO: MOVE LOCALS
let localWallet: BeaconWallet;
wallet.subscribe((x) => {
  localWallet = x
})

// TODO: Unify these two?
// The name of the Tezos blockchain network used 
export const networkStr: Writable<string> = writable<string>(null);
// Enum representation of the Tezos blockchain used
export const network: Writable<NetworkType> = writable<NetworkType>(
  NetworkType.MAINNET
);

// URL Prefix of the block explorer to be used.
export const betterCallDevUrl: Writable<string> = writable<string>(
  'https://api.better-call.dev'
);

// The UI element for poping toast-like alerts
export const alert: Writable<{
  message: string;
  variant: 'error' | 'warning' | 'success' | 'info';
}> =
  writable<{
    message: string;
    variant: 'error' | 'warning' | 'success' | 'info';
  }>(null);

/* 
 * Kepler Interactions 
*/

export const addToKepler = async (orbit: string, ...obj: Array<any>): Promise<Array<string>>=> {
  try {
    let addresses = await helpers.addToKepler(localKepler, orbit, ...obj);

    alert.set({
      message: 'Successfuly uploaded to Kepler',
      variant: 'success',
    });

    return addresses;
  } catch (e) {
      alert.set({
        message: e.message || JSON.stringify(e),
        variant: 'error',
      });

      throw e;
  }
}

export const saveToKepler = async(...obj: Array<any>): Promise<Array<string>> => {
  try {
    let addresses = await helpers.saveToKepler(localKepler, await localWallet.getPKH(), ...obj);

    alert.set({
      message: 'Successfuly uploaded to Kepler',
      variant: 'success',
    });

    return addresses;
  } catch (e) {
    alert.set({
      message: e.message || JSON.stringify(e),
      variant: 'error',
    });

    throw e;
  }
}

/* 
* Claims Interactions
*/


export let claimsStream: Writable<helpers.ClaimMap> = writable<helpers.ClaimMap>(
  addDefaults({})
);


export const contractClient: Writable<contractLib.TZProfilesClient> =
  writable<contractLib.TZProfilesClient>(null);

let localClaimsStream: helpers.ClaimMap;
let localClient: contractLib.TZProfilesClient;
let localContractAddress: string;
let localNetworkStr: string;

export let localKepler: Kepler;
export let viewerInstance: string = 'http://127.0.0.1:9090';

claimsStream.subscribe((x) => {
  localClaimsStream = x;
});

contractAddress.subscribe((x) => {
  localContractAddress = x;
});

contractClient.subscribe((x) => {
  localClient = x;
});

networkStr.subscribe((x) => {
  localNetworkStr = x;
});

const hashFunc = async (claimString: string): Promise<string> => {
  let encodedString = new TextEncoder().encode(claimString);
  let buf = await crypto.subtle.digest('SHA-256', encodedString);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const originate = async (): Promise<void> => {
  if (!localClient) {
    throw new Error('No wallet detected');
  }

  let claimsKeys = Object.keys(localClaimsStream);

  let claimsList: Array<[contractLib.ClaimType, contractLib.ClaimReference]> =
    [];

  for (let i = 0, x = claimsKeys.length; i < x; i++) {
    let claimKey = claimsKeys[i];
    let {irl} = localClaimsStream[claimKey];
    if (irl) {
      claimsList.push(['VerifiableCredential', irl]);
    }
  }

  if (claimsList.length < 1) {
    alert.set({
      message: 'No claim urls found',
      variant: 'error',
    });
    throw new Error('No claim urls found');
  }

  let contractAddr = await localClient.originate(claimsList);
  contractAddress.set(contractAddr);
};

export const addClaims = async (claimsList: Array<helpers.Claim>): Promise<string> => {
  if (!localClient) {
    alert.set({
      message: 'No wallet detected',
      variant: 'error',
    });
    throw new Error('No wallet detected');
  }

  if (!localContractAddress) {
    alert.set({
      message: 'No contractAddress detected',
      variant: 'error',
    });
    throw new Error('No contractAddress detected');
  }

  let claimsArgsList: Array<
    [contractLib.ClaimType, contractLib.ClaimReference]
  > = claimsList.map((claim) => {
    return ['VerifiableCredential', claim.irl || ''];
  });

  return await localClient.addClaims(localContractAddress, claimsArgsList);
};

export const removeClaims = async (
  claimsList: Array<helpers.Claim>
): Promise<string> => {
  if (!localClient) {
    alert.set({
      message: 'No smart contract client detected',
      variant: 'error',
    });
    throw new Error('No smart contract client detected');
  }

  if (!localContractAddress) {
    alert.set({
      message: 'No contractAddress detected',
      variant: 'error',
    });
    throw new Error('No contractAddress detected');
  }

  let claimsArgsList: Array<
    [contractLib.ClaimType, contractLib.ClaimReference]
  > = claimsList.map((claim) => {
    return ['VerifiableCredential', claim.irl || ''];
  });

  return await localClient.removeClaims(localContractAddress, claimsArgsList);
};

let urlNode = '';
let strNetwork = '';
let networkStrTemp = '';
let urlBetterCallDev = '';

// TODO: Specifically type?
function getVCType(vc: any): string {
  let nextVC = vc;
  if (typeof nextVC === 'string') {
    nextVC = JSON.parse(vc);
  }
  if (!nextVC || !nextVC?.type) {
    alert.set({
      message: 'Could not find property "type" in vc',
      variant: 'error',
    });
    throw new Error('Could not find property "type" in vc');
  }

  if (!Array.isArray(nextVC.type) || nextVC.type.length < 1) {
    alert.set({
      message: 'VC "type" property must be an array',
      variant: 'error',
    });
    throw new Error('VC "type" property must be an array');
  }

  return nextVC.type[nextVC.type.length - 1];
}

wallet.subscribe((w) => {
  if (w) {
    w.client.subscribeToEvent(
      BeaconEvent.PERMISSION_REQUEST_SUCCESS,
      async (data) => {
        userData.set(data);
        localKepler = new Kepler(
          keplerInstance,
          // NOTE: Ran into a typing err w/o any
          // Consider correcting?
          await authenticator(w.client as any, process.env.KEPLER_URL)
        );

        let bcdOpts: contractLib.BetterCallDevOpts = {
          base: urlBetterCallDev,
          network: networkStrTemp as contractLib.BetterCallDevNetworks,
          version: 1 as contractLib.BetterCallDevVersions,
        };

        let signerOpts: contractLib.WalletSigner = {
          type: 'wallet',
          wallet: w,
        };

        let clientOpts: contractLib.TZProfilesClientOpts = {
          betterCallDevConfig: bcdOpts,
          keplerClient: localKepler,
          hashContent: hashFunc,
          nodeURL: urlNode,
          signer: signerOpts,
          validateType: async (
            c: contractLib.ClaimContent,
            t: contractLib.ClaimType
          ): Promise<void> => {
            // Validate VC
            switch (t) {
              case "VerifiableCredential": {
                let verifyResult = await verifyCredential(c, '{}');
                let verifyJSON = JSON.parse(verifyResult);
                if (verifyJSON.errors.length > 0) {
                  throw new Error(
                    `Verifying ${c}: ${verifyJSON.errors.join(', ')}`
                  );
                }
                break;
              }
              default:
                throw new Error(`Unknown ClaimType: ${t}`);
            }
          },
        };

        let nextClient = new contractLib.TZProfilesClient(clientOpts);
        contractClient.set(nextClient);

        loadingContracts.set(true);
        try {
          let result = await nextClient.retrieve(await w.getPKH());
          if (result) {
            contractAddress.set(result.address);
            let nextClaims = Object.assign({}, localClaimsStream);

            for (let i = 0, x = result.valid.length; i < x; i++) {
              let [url, content, contentType] = result.valid[i];
              // TODO: Handle other types?
              if (contentType === 'VerifiableCredential') {
                let vcType = getVCType(content);
                switch (vcType) {
                  case 'TwitterVerification':
                    nextClaims['twitter'] = helpers.claimFromTriple(
                      'twitter', 
                      [url, content, contentType]
                    );
                    break;
                  case 'BasicProfile':
                    nextClaims['basic'] = helpers.claimFromTriple(
                      'basic',
                      [url, content, contentType]
                    )
                    break;
                  default:
                    alert.set({
                      message: `Unknown VC Type: ${vcType}`,
                      variant: 'error',
                    });
                    throw new Error(`Unknown VC Type: ${vcType}`);
                }
              }

              nextClaims = addDefaults(nextClaims)

              claimsStream.set(nextClaims);
            }
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

network.subscribe((network) => {
  if (network === NetworkType.CUSTOM) {
    networkStr.set('sandboxnet');
    // TODO can't read from writeable, but then I don't understand why others work.
    networkStrTemp = 'sandboxnet';
    strNetwork = 'custom';

    nodeUrl.set('http://localhost:8732');
    urlNode = 'http://localhost:8732';

    urlBetterCallDev = 'http://localhost:14000';
    betterCallDevUrl.set('http://localhost:14000');
  } else {
    networkStr.set(network === NetworkType.EDONET ? 'edo2net' : network);
    // TODO can't read from writeable, but then I don't understand why others work.
    networkStrTemp = network === NetworkType.EDONET ? 'edo2net' : network;
    strNetwork = network;

    urlNode = `https://${network}.smartpy.io/`;
    nodeUrl.set(urlNode);

    urlBetterCallDev = 'https://api.better-call.dev';
    betterCallDevUrl.set('https://api.better-call.dev');
  }
});

export const initWallet: () => Promise<void> = async () => {
  const options = {
    name: 'Tezos Personal Profile',
    iconUrl: 'https://tezostaquito.io/img/favicon.png',
    preferredNetwork: strNetwork as NetworkType,
  };

  const requestPermissionsInput = {
    network: {
      type: strNetwork as NetworkType,
      rpcUrl: urlNode,
      name: `${localNetworkStr}`,
    },
  };

  const newWallet = new BeaconWallet(options);

  try {
    wallet.set(newWallet);
    await newWallet.requestPermissions(requestPermissionsInput);

    localKepler = new Kepler(
      keplerInstance,
      // NOTE: Ran into a typing err w/o any
      // Consider correcting?
      await authenticator(newWallet.client as any, process.env.KEPLER_URL)
    );
    const Tezos = new TezosToolkit(urlNode);
    Tezos.addExtension(new Tzip16Module());
    Tezos.setWalletProvider(newWallet);
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
// TODO: Make the network var reasonable / consistent / documented.
export let searchClaims: Writable<helpers.ClaimMap> = writable(addDefaults({}));

export interface searchRetryOpts {
  current: number;
  max: number;
  step: number;
}

export const defaultSearchOpts = {
  current: 0,
  max: 10000,
  step: 1000,
};

const searchRetry = async (
  addr: string,
  contractClient: contractLib.TZProfilesClient,
  opts: searchRetryOpts
): Promise<contractLib.ContentResult<any, any, any, any> | false> => {
  try {
    let found;
    if (networkStrTemp === "mainnet") {
      let data = {
        query: `query MyQuery { tzprofiles_by_pk(account: \"${addr}\") { invalid_claims valid_claims contract } }`,
        variables: null,
        operationName: "MyQuery"
      }
      found = await fetch("https://indexer.tzprofiles.com/v1/graphql", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      found = await found.json()
      found = found.data.tzprofiles_by_pk
      found = {address: found.contract, valid: found.valid_claims, invalid: found.invalid_claims}
    } else {
      found = await contractClient.retrieve(addr);
    }

    return found;
  } catch (err) {
    if (opts.current >= opts.max) {
      throw Error(
        `Found contract, encountered repeated network errors, gave up on: ${err.message}`
      );
    }
    opts.current += opts.step;

    let f = (): Promise<
      contractLib.ContentResult<any, any, any, any> | false
    > => {
      return new Promise((resolve, reject) => {
        let innerF = async () => {
          let found = await searchRetry(addr, contractClient, opts);
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
      searchClaims.set(addDefaults({}));

      let bcdOpts: contractLib.BetterCallDevOpts = {
        base: urlBetterCallDev,
        network: networkStrTemp as contractLib.BetterCallDevNetworks,
        version: 1 as contractLib.BetterCallDevVersions,
      };

      let dummyAuthenticator = {
        content: async (orbit: string, cids: string[], action: Action) => '',
        createOrbit: async (cids: string[]) => '',
      };

      // Kepler Client with no wallet.
      let searchKepler = new Kepler(keplerInstance, dummyAuthenticator);

      let clientOpts: contractLib.TZProfilesClientOpts = {
        betterCallDevConfig: bcdOpts,
        keplerClient: searchKepler,
        hashContent: hashFunc,
        nodeURL: urlNode,
        signer: false,
        validateType: async (
          c: contractLib.ClaimContent,
          t: contractLib.ClaimType
        ): Promise<void> => {
          // Validate VC
          switch (t) {
            case 'VerifiableCredential': {
              let verifyResult = await verifyCredential(c, '{}');
              let verifyJSON = JSON.parse(verifyResult);
              if (verifyJSON.errors.length > 0)
                throw new Error(
                  `Verifying ${c}: ${verifyJSON.errors.join(', ')}`
                );
              break;
            }
            default:
              throw new Error(`Unknown ClaimType: ${t}`);
          }
        },
      };

      let contractClient = new contractLib.TZProfilesClient(clientOpts);

      let found = await searchRetry(wallet, contractClient, opts);
      if (found) {
        let nextSearchClaims = addDefaults({});
        searchAddress.set(found.address);
        // NOTE: We are not dealing with invalid claims in the UI
        // TODO: Handle invalid claims
        found.valid.forEach((triple) => {
          let [_irl, contentStr, _contractType] = triple;
          // TODO: Check if it's a vc via contractType?
          let vc = JSON.parse(contentStr);
          let ct = claimTypeFromVC(vc);
          if (!ct) {
            throw new Error(`No claim type found in vc: ${JSON.stringify(vc?.type)}`);
          }

          nextSearchClaims[ct] = claimFromTriple(ct, triple);
        });

        searchClaims.set(nextSearchClaims);
        return;
      }
    } catch (err) {
      alert.set({
        message: err.message || 'Network error',
        variant: 'error',
      });
      console.error(err);
      throw err;
    }
  }

  alert.set({
    message: `No contract found for ${wallet}`,
    variant: 'error',
  });
  throw new Error(`No contract found for ${wallet}`);
};
