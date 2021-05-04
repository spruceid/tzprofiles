import { BeaconWallet } from '@taquito/beacon-wallet';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { TezosToolkit } from '@taquito/taquito';
import { Tzip16Module } from '@taquito/tzip16';
import NetworkType from 'enums/NetworkType';
import BeaconEvent from 'enums/BeaconEvent';
import * as contractLib from 'tezospublicprofiles';
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
        .put(dummyOrbit, first, rest)
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
export const twitterHandle: Writable<string> = writable<string>(null);
export const profileUrl: Writable<string> = writable<string>(null);

export const localBasicProfile: Writable<any> = writable(null);
export const localTwitterProfile: Writable<any> = writable(null);
const keplerResolve = async (url, _) => await localKepler.resolve(url, false);

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
DIDKit.subscribe((x) => {
  localDIDKit = x;
});
wallet.subscribe((x) => {
  localWallet = x;
});

const hashFunc = async (claimString: string): Promise<ArrayBuffer> => {
  let encodedString = new TextEncoder().encode(claimString);
  return await crypto.subtle.digest('SHA-256', encodedString);
};

export const originate = async (): Promise<void> => {
  if (!localWallet) {
    throw new Error('No wallet detected');
  }

  if (!localDIDKit || !localDIDKit.verifyCredential) {
    throw new Error('No DIDKit detected');
  }

  let claimsKeys = Object.keys(localClaimsStream);

  let urlList: string[] = [];

  for (let i = 0, x = claimsKeys.length; i < x; i++) {
    let claimKey = claimsKeys[i];
    let { url } = localClaimsStream[claimKey];
    if (url) {
      urlList.push(url);
    }
  }

  if (urlList.length < 1) {
    throw new Error('No claim urls found');
  }

  let opts = {
    useWallet: true,
    wallet: localWallet,
  };

  let contractAddr = await contractLib.originate(
    opts,
    urlNode,
    urlList,
    localDIDKit.verifyCredential,
    hashFunc,
    keplerResolve
  );

  contractAddress.set(contractAddr);
};

export const addClaim = async (claim: Claim): Promise<void> => {
  if (!localWallet) {
    throw new Error('No wallet detected');
  }

  if (!localContractAddress) {
    throw new Error('No contractAddress detected');
  }

  if (!localDIDKit || !localDIDKit.verifyCredential) {
    throw new Error('No DIDKit detected');
  }

  let opts = {
    useWallet: true,
    wallet: localWallet,
  };

  await contractLib.add_claim(
    opts,
    localContractAddress,
    claim.url,
    urlNode,
    localDIDKit.verifyCredential,
    hashFunc,
    keplerResolve
  );
};

export const removeClaim = async (claim: Claim): Promise<void> => {
  if (!localWallet) {
    throw new Error('No wallet detected');
  }

  if (!localContractAddress) {
    throw new Error('No contractAddress detected');
  }

  if (!localDIDKit || !localDIDKit.verifyCredential) {
    throw new Error('No DIDKit detected');
  }

  let opts = {
    useWallet: true,
    wallet: localWallet,
  };

  await contractLib.remove_claim(
    opts,
    localContractAddress,
    claim.url,
    urlNode,
    localDIDKit.verifyCredential,
    hashFunc,
    fetch
  );
};

let urlNode = '';
let strNetwork = '';
let urlBetterCallDev = '';

wallet.subscribe((wallet) => {
  if (wallet) {
    wallet.client.subscribeToEvent(
      BeaconEvent.PERMISSION_REQUEST_SUCCESS,
      async (data) => {
        userData.set(data);

        loadingContracts.set(true);
        try {
          let contractJSON = await contractLib.retrieve_tpp_claims(
            urlBetterCallDev,
            await wallet.getPKH(),
            strNetwork,
            fetch
          );

          if (contractJSON) {
            let nextClaims = Object.assign({}, localClaimsStream);
            // TODO: FIX THIS IN LIB UPDATE -- INDEX 0 IS USED TO A PLAIN CONTRACT ADDRESS:
            if (contractJSON[0]) {
              contractAddress.set(contractJSON[0])
            }
            for (let i = 1, x = contractJSON.length; i < x; i++) {
              let [url, _hash, contentType] = contractJSON[i];
              // TODO: Stop using content type here, unravel the VC a bit.
              if (contentType === 'BasicProfile') {
                nextClaims.TezosControl.url = url;;
                loadBasicProfile(nextClaims);
              }

              if (contentType === 'VerifiableCredential') {
                nextClaims.TwitterControl.url = url;
                loadTwitterProfile(nextClaims);
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
    strNetwork = NetworkType.CUSTOM;

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

  console.log({
    type: network,
    rpcUrl: urlNode,
    name: strNetwork,
  })
  const requestPermissionsInput = {
    network: {
      type: (strNetwork === "localhost" ? NetworkType.CUSTOM : strNetwork) as NetworkType,
      rpcUrl: urlNode,
      name: strNetwork,
    },
  };

  const newWallet = new BeaconWallet(options);

  try {
    wallet.set(newWallet);
    await newWallet.requestPermissions(requestPermissionsInput);
    localKepler = new Kepler(
      keplerInstance,
      await authenticator(newWallet.client)
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
