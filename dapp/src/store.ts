import { BeaconWallet } from '@taquito/beacon-wallet';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { TezosToolkit } from '@taquito/taquito';
import { Tzip16Module } from '@taquito/tzip16';
import NetworkType from 'enums/NetworkType';
import BeaconEvent from 'enums/BeaconEvent';
import * as contractLib from 'tzprofiles';

import { PersonOutlined, TwitterIcon } from 'components';
import SvelteComponentDev from '*.svelte';
// TODO fix export in kepler :facepalm:
import { Kepler, authenticator } from 'kepler-sdk';
import { loadDIDKit } from './loader/didkit-loader';

export const saveToKepler = async (...obj) => {
  const dummyOrbit = 'uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA';
  if (localKepler) {
    try {
      const [first, ...rest] = obj;
      const addresses = await localKepler
        .put(dummyOrbit, first, ...rest)
        .then((r) => r.text());
      alert.set({
        message: 'Successfuly uploaded to Kepler',
        variant: 'success',
      });

      return addresses
        .split('\n')
        .map((address) => `kepler://v0:${dummyOrbit}/${address}`);
    } catch (e) {
      alert.set({
        message: e.message || JSON.stringify(e),
        variant: 'error',
      });
      throw e;
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
  TezosControl: { url },
}: ClaimMap): Promise<void> => {
  if (url) {
    const res = await loadJsonBlob(url);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Failed in Basic Profile Fetch ${res.statusText}`);
    }

    let json = await res.json();

    // TODO: Make this consistant through different usage of Kepler:
    // AUTHOR'S HACK: This would fail with more than 2 claim!
    if (Array.isArray(json)) {
      json = json[0];
    }

    const { credentialSubject } = json;
    const { alias, description, website, logo } = credentialSubject;
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
  TwitterControl: { url },
}: ClaimMap): Promise<void> => {
  if (url) {
    const res = await loadJsonBlob(url);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Failed in Basic Profile Fetch ${res.statusText}`);
    }

    let json = await res.json();
    // TODO: Make this consistant through different usage of Kepler:
    // AUTHOR'S HACK: This would fail with more than 2 claim!
    if (Array.isArray(json)) {
      json = json[0];
    }

    const { credentialSubject } = json;
    const { sameAs } = credentialSubject;
    const handle = sameAs.replace('https://twitter.com/', '');
    twitterHandle.set(handle);
    localTwitterProfile.set(json);
  } else {
    twitterHandle.set('');
    localTwitterProfile.set(null);
  }
};

export let DIDKit = writable(null);

loadDIDKit('/didkit_wasm_bg.wasm').then((x) => {
  DIDKit.set(x);
});

export const userData = writable(null);
export const contractAddress: Writable<string> = writable<string>(null);
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
}> = writable<{
  message: string;
  variant: 'error' | 'warning' | 'success' | 'info';
}>(null);

export let claimsStream: Writable<ClaimMap> = writable<ClaimMap>({
  TwitterControl: {
    display: 'Twitter Account Verification',
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
    display: 'Basic Profile Information',
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
});

export const basicAlias: Writable<string> = writable<string>(null);
export const basicDescription: Writable<string> = writable<string>(null);
export const basicWebsite: Writable<string> = writable<string>(null);
export const basicLogo: Writable<string> = writable<string>(null);
export const contractClient: Writable<contractLib.TZProfilesClient> = writable<contractLib.TZProfilesClient>(null);
export const twitterHandle: Writable<string> = writable<string>(null);
export const profileUrl: Writable<string> = writable<string>(null);

export const localBasicProfile: Writable<any> = writable(null);
export const localTwitterProfile: Writable<any> = writable(null);

export interface ClaimMap {
  [index: string]: Claim;
}

export interface Claim {
  display: string;
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
let localDIDKit: any;
let localWallet: BeaconWallet;
export let localKepler: Kepler<any>;
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
DIDKit.subscribe((x) => {
  localDIDKit = x;
});
wallet.subscribe((x) => {
  localWallet = x;
});

const hashFunc = async (claimString: string): Promise<string> => {
  let encodedString = new TextEncoder().encode(claimString);
  let buf = await crypto.subtle.digest('SHA-256', encodedString);
  return [...new Uint8Array (buf)]
        .map (b => b.toString (16).padStart (2, "0"))
        .join ("");
};

export const originate = async (): Promise<void> => {
  if (!localClient) {
    throw new Error('No wallet detected');
  }

  let claimsKeys = Object.keys(localClaimsStream);

  // TODO: Specifically type?
  let claimsList: Array<[
    contractLib.ClaimType, 
    contractLib.ClaimReference
  ]> = [];

  for (let i = 0, x = claimsKeys.length; i < x; i++) {
    let claimKey = claimsKeys[i];
    let { url } = localClaimsStream[claimKey];
    if (url) {
      claimsList.push([ 
        "VerifiableCredential",
        url
      ]);
    }
  }

  if (claimsList.length < 1) {
    throw new Error('No claim urls found');
  }

  let contractAddr = await localClient.originate(claimsList);
  contractAddress.set(contractAddr);
};

export const addClaims = async (claimsList: Array<Claim>): Promise<string> => {
  if (!localClient) {
    throw new Error('No wallet detected');
  }

  if (!localContractAddress) {
    throw new Error('No contractAddress detected');
  }

  let claimsArgsList: Array<
    [
      contractLib.ClaimType, 
      contractLib.ClaimReference
    ]
  > = claimsList.map((claim) => {
    return ["VerifiableCredential", claim.url];
  });

  return await localClient.addClaims(localContractAddress, claimsArgsList);
};

export const removeClaims = async (claimsList: Array<Claim>): Promise<string> => {
  if (!localClient) {
    throw new Error('No smart contract client detected');
  }

  if (!localContractAddress) {
    throw new Error('No contractAddress detected');
  }

  let claimsArgsList: Array<
    [
      contractLib.ClaimType, 
      contractLib.ClaimReference
    ]
  > = claimsList.map((claim) => {
    return ["VerifiableCredential", claim.url];
  });

  return await localClient.removeClaims(localContractAddress, claimsArgsList)
};

let urlNode = '';
let strNetwork = '';
let urlBetterCallDev = '';

// TODO: Specifically type?
function getVCType(vc: any): string {
  let nextVC = vc;
  if (typeof nextVC === 'string') {
    nextVC = JSON.parse(vc)
  }
  if (!nextVC || !nextVC?.type) {
    throw new Error('Could not find property "type" in vc');
  }

  if (!Array.isArray(nextVC.type) || nextVC.type.length < 1) {
    throw new Error('VC "type" property must be an array');
  }

  return nextVC.type[nextVC.type.length - 1];
}

wallet.subscribe((wallet) => {
  if (wallet) {
    wallet.client.subscribeToEvent(
      BeaconEvent.PERMISSION_REQUEST_SUCCESS,
      async (data) => {
        userData.set(data);
        localKepler = new Kepler(
          keplerInstance,
          // NOTE: Ran into a typing err w/o any
          // Consider correcting?
          await authenticator<any>(wallet.client)
        );

        let bcdOpts: contractLib.BetterCallDevOpts = {
          base: urlBetterCallDev,
          network: strNetwork as contractLib.BetterCallDevNetworks,
          version: 1 as contractLib.BetterCallDevVersions
        };

        let signerOpts: contractLib.WalletSigner = {
          type: "wallet",
          wallet
        }

        let clientOpts: contractLib.TZProfilesClientOpts = {
          betterCallDevConfig: bcdOpts,
          keplerClient: localKepler,
          hashContent: hashFunc,
          nodeURL: urlNode,
          signer: signerOpts,
          validateType: async () => {}
          // TODO: RESTORE
          // validateType: async (c: contractLib.ClaimContent, t: contractLib.ClaimType): Promise<void> => {
          //     // Validate VC
          //     switch (t){
          //       case "VerifiableCredential": {
          //         let verifyResult = await localDIDKit.verifyCredential(c, '{}');
          //         let verifyJSON = JSON.parse(verifyResult);
          //         if (verifyJSON.errors.length > 0) throw new Error(verifyJSON.errors.join(", "));
          //         break;
          //       }
          //       default: 
          //         throw new Error(`Unknown ClaimType: ${t}`);
          //     }
          // }
        };

        let nextClient = new contractLib.TZProfilesClient(clientOpts);
        contractClient.set(nextClient);

        loadingContracts.set(true);
        try {
          let result = await nextClient.retrieve(await wallet.getPKH());
          if (result) {
            contractAddress.set(result.address);
            let nextClaims = Object.assign({}, localClaimsStream);
            for (let i = 0, x = result.valid.length; i < x; i++) {
              let [url, content, contentType] = result.valid[i];
              // TODO: Handle other types?
              if (contentType === 'VerifiableCredential') {
                let vcType = getVCType(content);

                switch (vcType) {
                  case "TwitterVerification":
                    nextClaims.TwitterControl.url = url;
                    loadTwitterProfile(nextClaims);
                    break;
                  case "BasicProfile":
                    nextClaims.TezosControl.url = url;
                    loadBasicProfile(nextClaims);
                    break;
                  default:
                    throw new Error(`Unknown VC Type: ${vcType}`)
                }

              }
              claimsStream.set(nextClaims);
            }
          } else {
            console.warn('No contract detected, starting new one');
          }
        } catch (e) {
          console.error(`store::load_contracts:: ${e}`);
        } finally {
          loadingContracts.set(false);
        }
      }
    );
  }
});

network.subscribe((network) => {
  if (network === NetworkType.CUSTOM) {
    networkStr.set('localhost');
    strNetwork = 'localhost';

    nodeUrl.set('http://localhost:8732');
    urlNode = 'http://localhost:8732';

    urlBetterCallDev = 'http://localhost:14000';
    betterCallDevUrl.set('http://localhost:14000');
  } else {
    networkStr.set(network);
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
  };

  const requestPermissionsInput = {
    network: {
      type: strNetwork as NetworkType,
      rpcUrl: urlNode,
      name: `${networkStr}`,
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
      await authenticator<any>(newWallet.client)
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
