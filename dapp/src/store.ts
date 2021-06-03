import {BeaconWallet} from '@taquito/beacon-wallet';
import type {Writable} from 'svelte/store';
import {writable} from 'svelte/store';
import {TezosToolkit} from '@taquito/taquito';
import {Tzip16Module} from '@taquito/tzip16';
import NetworkType from 'enums/NetworkType';
import BeaconEvent from 'enums/BeaconEvent';
import * as contractLib from 'tzprofiles';

import {PersonOutlined, TwitterIcon} from 'components';
import SvelteComponentDev from '*.svelte';
import {Kepler, authenticator, Action, getOrbitId} from 'kepler-sdk';
import {verifyCredential} from 'didkit-wasm';
import ProfileDisplay from 'enums/ProfileDisplay';

export const addToKepler = async (orbit, ...obj) => {
  obj.forEach((o) => console.log(o));
  if (localKepler) {
    try {
      // Get around the error of possibly passing nothing.
      let f = obj.pop();
      if (!f) {
        throw new Error('Empty array passed to saveToKepler');
      }

      const res = await localKepler.put(orbit, f, ...obj);
      if (!res.ok || res.status !== 200) {
        throw new Error(`Failed to create orbit: ${res.statusText}`);
      }

      const addresses = await res.text();

      alert.set({
        message: 'Successfuly uploaded to Kepler',
        variant: 'success',
      });

      return addresses.split('\n');
    } catch (e) {
      alert.set({
        message: e.message || JSON.stringify(e),
        variant: 'error',
      });
      throw e;
    }
  }

  throw new Error('No Kepler integration found');
}

export const saveToKepler = async (...obj) => {
  obj.forEach((o) => console.log(o));

  // Get around the error of possibly passing nothing.
  let f = obj.pop();
  if (!f) {
    throw new Error('Empty array passed to saveToKepler');
  }

  if (localKepler) {
    try {
      const res = await localKepler.createOrbit(f, ...obj);
      if (!res.ok || res.status !== 200) {
        throw new Error(`Failed to create orbit: ${res.statusText}`);
      }

      const addresses = await res.text();

      alert.set({
        message: 'Successfuly uploaded to Kepler',
        variant: 'success',
      });

      return addresses.split('\n');
    } catch (e) {
      console.warn(`Failed in create new orbit with error: ${e?.message || JSON.stringify(e)}`)
      console.warn("Trying existing orbit")
      try {
        let p = await localWallet.getPKH()
        let id = await getOrbitId(p, {domain: process.env.KEPLER_URL, index: 0});

        return await addToKepler(id, ...[f, ...obj]);
      } catch (err) {
        alert.set({
          message: err.message || JSON.stringify(err),
          variant: 'error',
        });
        throw err;
      }
    }
  }

  throw new Error('No Kepler integration found');
};

export const loadJsonBlob = async (url: string): Promise<any> => {
  if (!url.startsWith('blob:')) {
    return await localKepler.resolve(url, false);
  }
  return await fetch(url);
};

// TODO: Change to not deref the URL, since the client already is
export const loadBasicProfile = async ({
  TezosControl: {url},
}: ClaimMap): Promise<void> => {
  if (url) {
    const res = await loadJsonBlob(url);
    if (!res.ok || res.status !== 200) {
      alert.set({
        message: `Failed in Basic Profile Fetch ${res.statusText}`,
        variant: 'error',
      });
      throw new Error(`Failed in Basic Profile Fetch ${res.statusText}`);
    }

    let json = await res.json();

    // TODO: Make this consistant through different usage of Kepler:
    // AUTHOR'S HACK: This would fail with more than 2 claim!
    if (Array.isArray(json)) {
      json = json[0];
    }

    const {credentialSubject} = json;
    const {alias, description, website, logo} = credentialSubject;
    basicAlias.set(alias);
    basicWebsite.set(website);
    basicDescription.set(description);
    basicLogo.set(logo);
    localBasicProfile.set(json);
  } else {
    basicAlias.set('');
    basicWebsite.set('');
    basicDescription.set('');
    basicLogo.set('');
    localBasicProfile.set(null);
  }
};

// TODO: Change to not deref the URL, since the client already is
export const loadTwitterProfile = async ({
  TwitterControl: {url},
}: ClaimMap): Promise<void> => {
  if (url) {
    const res = await loadJsonBlob(url);
    if (!res.ok || res.status !== 200) {
      alert.set({
        message: `Failed in Basic Profile Fetch ${res.statusText}`,
        variant: 'error',
      });
      throw new Error(`Failed in Basic Profile Fetch ${res.statusText}`);
    }

    let json = await res.json();
    // TODO: Make this consistant through different usage of Kepler:
    // AUTHOR'S HACK: This would fail with more than 2 claim!
    if (Array.isArray(json)) {
      json = json[0];
    }

    const {credentialSubject, evidence} = json;
    const {sameAs} = credentialSubject;
    const handle = sameAs.replace('https://twitter.com/', '');
    twitterHandle.set(handle);
    tweetUrl.set(`https://twitter.com/${handle}/status/${evidence.tweetId}`)
    localTwitterProfile.set(json);
  } else {
    twitterHandle.set('');
    localTwitterProfile.set(null);
  }
};

export const userData = writable(null);
export const contractAddress: Writable<string> = writable<string>(null);
export const searchAddress: Writable<string> = writable<string>(null);
export const keplerInstance = process.env.KEPLER_URL;
export const witnessUrl = process.env.WITNESS_URL;
export let nodeUrl: Writable<string> = writable<string>(null);
export let loadingContracts: Writable<boolean> = writable(true);
export let networkStr: Writable<string> = writable<string>(null);
export const wallet: Writable<BeaconWallet> = writable<BeaconWallet>(null);
export const network: Writable<NetworkType> = writable<NetworkType>(
  NetworkType.MAINNET
);
export const betterCallDevUrl: Writable<string> = writable<string>(
  'https://api.better-call.dev'
);

export let alert: Writable<{
  message: string;
  variant: 'error' | 'warning' | 'success' | 'info';
}> =
  writable<{
    message: string;
    variant: 'error' | 'warning' | 'success' | 'info';
  }>(null);

// Sets the claimsStream object back to sane defaults
export const newClaimsStream = (): ClaimMap => {
  return {
    TwitterControl: {
      display: ProfileDisplay.TWITTER,
      url: '',
      type: 'Social Media',
      proof: 'Tweet',
      title: 'Twitter Verification',
      description:
        'This process is used to link your Twitter account to your Tezos account by signing a message using your private key, entering your Twitter handle, and finally, tweeting that message.',
      icon: () => TwitterIcon,
      route: '/twitter',
      contractType: 'VerifiableCredential',
    },
    TezosControl: {
      display: ProfileDisplay.BASIC,
      url: '',
      type: 'Basic Profile',
      proof: 'Self-Attestation',
      title: 'Basic Profile',
      description:
        'This process is used to generate some basic profile information about yourself by filling in an alias, description, and logo for your profile.',
      icon: () => PersonOutlined,
      route: '/basic-profile',
      contractType: 'VerifiableCredential',
    },
  };
};

export let claimsStream: Writable<ClaimMap> = writable<ClaimMap>(
  newClaimsStream()
);

export const basicAlias: Writable<string> = writable<string>(null);
export const basicDescription: Writable<string> = writable<string>(null);
export const basicWebsite: Writable<string> = writable<string>(null);
export const basicLogo: Writable<string> = writable<string>(null);
export const contractClient: Writable<contractLib.TZProfilesClient> =
  writable<contractLib.TZProfilesClient>(null);
export const twitterHandle: Writable<string> = writable<string>(null);
export const tweetUrl: Writable<string> = writable<string>(null);
export const profileUrl: Writable<string> = writable<string>(null);

export const localBasicProfile: Writable<any> = writable(null);
export const localTwitterProfile: Writable<any> = writable(null);

export interface ClaimMap {
  [index: string]: Claim;
}

export interface Claim {
  display: ProfileDisplay;
  url: string;
  type: string;
  proof: string;
  title: string;
  description: string;
  icon: () => typeof SvelteComponentDev;
  route: string;
  contractType: string;
}

let localClaimsStream: ClaimMap;
let localClient: contractLib.TZProfilesClient;
let localContractAddress: string;
let localNetworkStr: string;
let localWallet: BeaconWallet;
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
wallet.subscribe((x) => {
  localWallet = x;
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

  // TODO: Specifically type?
  let claimsList: Array<[contractLib.ClaimType, contractLib.ClaimReference]> =
    [];

  for (let i = 0, x = claimsKeys.length; i < x; i++) {
    let claimKey = claimsKeys[i];
    let {url} = localClaimsStream[claimKey];
    if (url) {
      claimsList.push(['VerifiableCredential', url]);
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

export const addClaims = async (claimsList: Array<Claim>): Promise<string> => {
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
    return ['VerifiableCredential', claim.url];
  });

  return await localClient.addClaims(localContractAddress, claimsArgsList);

};

export const removeClaims = async (
  claimsList: Array<Claim>
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
    return ['VerifiableCredential', claim.url];
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
                    nextClaims.TwitterControl.url = url;
                    loadTwitterProfile(nextClaims);
                    break;
                  case 'BasicProfile':
                    nextClaims.TezosControl.url = url;
                    loadBasicProfile(nextClaims);
                    break;
                  default:
                    alert.set({
                      message: `Unknown VC Type: ${vcType}`,
                      variant: 'error',
                    });
                    throw new Error(`Unknown VC Type: ${vcType}`);
                }
              }
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

    nodeUrl.set(`https://api.tez.ie/rpc/${network}`);
    urlNode = `https://api.tez.ie/rpc/${network}`;

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
// TODO: Organize
// TODO: Make the network var reasonable / consistent / documented.
export let claims: Writable<any> = writable({
  BasicProfile: false,
  TwitterProfile: false,
});

let localClaims;

claims.subscribe((x) => (localClaims = x));

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
    let found = await contractClient.retrieve(addr);

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
        searchAddress.set(found.address);
        // NOTE: We are not dealing with invalid claims in the UI
        // TODO: Handle invalid claims
        found.valid.forEach((triple) => {
          let [_url, claimStr, _type] = triple;
          let claim = JSON.parse(claimStr);

          claim.type.forEach((type) => {
            switch (type) {
              case 'TwitterVerification':
                localClaims.TwitterProfile = claim;
                break;
              case 'BasicProfile':
                localClaims.BasicProfile = claim;
                break;
              default:
                break;
            }
          });
        });
        claims.set(localClaims);
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
