import { BeaconWallet } from '@taquito/beacon-wallet';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { TezosToolkit } from '@taquito/taquito';
import { Tzip16Module } from '@taquito/tzip16';
import NetworkType from 'enums/NetworkType';
import BeaconEvent from 'enums/BeaconEvent';
import { loadDIDKit } from 'didkit-wasm/didkit-loader';
import * as contractLib from 'tezospublicprofiles';
import { PersonOutlined, TwitterIcon } from 'components';
import SvelteComponentDev from '*.svelte';
// TODO fix export in kepler :facepalm:
import { Kepler, authenticator } from 'kepler-sdk';

// TODO: Change this to kepler, then remove.
export const saveToKepler = async (obj) => {
  const dummyOrbit = 'uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA';
  if (localKepler) {
    try {
      const address = await localKepler.put(dummyOrbit, obj);
      alert.set({
        message: 'Successfuly uploaded to Kepler',
        variant: 'success',
      });

      return `${keplerInstance}/${dummyOrbit}/${address}`;
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
  if (localKepler) {
    const [orbit, cid] = url.split('/').slice(-2);
    console.log(url, url.split('/').slice(-2));
    return await localKepler.get(orbit, cid, false);
  }
  return await fetch(url)
    .then((r) => r.blob())
    .then((b) => b.text())
    .then((s) => JSON.parse(JSON.parse(s)));
};

export const loadCoreProfile = async ({
  TezosControl: { url },
}: ClaimMap): Promise<void> => {
  if (url) {
    const res = await fetch(url);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Failed in Core Profile Fetch ${res.statusText}`);
    }

    const innerJSON = await res.json();
    const json = JSON.parse(innerJSON);
    const { credentialSubject } = json;
    const { alias, description, website, logo } = credentialSubject;
    coreAlias.set(alias);
    coreWebsite.set(website);
    coreDescription.set(description);
    coreLogo.set(logo);
  } else {
    coreAlias.set('');
    coreWebsite.set('');
    coreDescription.set('');
    coreLogo.set('');
  }
};

export const loadTwitterProfile = async ({
  TwitterControl: { url },
}: ClaimMap): Promise<void> => {
  if (url) {
    const res = await fetch(url);
    if (!res.ok || res.status !== 200) {
      throw new Error(`Failed in Core Profile Fetch ${res.statusText}`);
    }

    const innerJSON = await res.json();
    const json = JSON.parse(innerJSON);

    const { credentialSubject } = json;
    const { sameAs } = credentialSubject;
    const handle = sameAs.replace('https://twitter.com/', '');
    twitterHandle.set(handle);
  } else {
    twitterHandle.set('');
  }
};

export let DIDKit = writable(null);
export const userData = writable(null);
export const contractAddress: Writable<string> = writable<string>(null);
export const dappUrl = 'http://localhost:8080';
export const witnessUrl = 'http://localhost:8787';
// export const witnessUrl = 'https://tzprofiles_witness.krhoda-spruce.workers.dev';
export let nodeUrl: Writable<string> = writable<string>(null);
export let loadingContracts: Writable<boolean> = writable(true);
export let networkStr: Writable<string> = writable<string>(null);
export const wallet: Writable<BeaconWallet> = writable<BeaconWallet>(null);
export const network: Writable<NetworkType> = writable<NetworkType>(
  NetworkType.MAINNET
);
export let betterCallDevUrl: Writable<string> = writable<string>(
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
    contractType: 'TwitterVerification',
  },
  TezosControl: {
    display: 'Basic Profile Information',
    url: '',
    type: 'Core Profile',
    proof: 'Self-Attestation',
    title: 'Core Profile',
    description:
      'This process is used to generate some basic profile information about yourself by filling in an alias, description, and logo for your profile.',
    icon: () => PersonOutlined,
    route: '/core-profile',
    contractType: 'CoreProfile',
  },
});

export let coreAlias: Writable<string> = writable<string>(null);
export let coreDescription: Writable<string> = writable<string>(null);
export let coreWebsite: Writable<string> = writable<string>(null);
export let coreLogo: Writable<string> = writable<string>(null);
export let twitterHandle: Writable<string> = writable<string>(null);
export let profileUrl: Writable<string> = writable<string>(null);

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
let localKepler: Kepler;
let keplerInstance: string = 'http://127.0.0.1:8000';

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
    let claim = localClaimsStream[claimKey];
    if (claim.url) {
      urlList.push(claim.url);
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
    fetch
  );

  contractAddress.set(contractAddr);
  console.log(`originated contract: ${contractAddr}`);
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
    fetch
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

loadDIDKit('/didkit_wasm_bg.wasm').then(DIDKit.set);

let urlNode = '';
let strNetwork = '';
let urlBetterCallDev = '';
let localClaims: any = {};

claimsStream.subscribe((claims) => {
  localClaims = claims;
});

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
            strNetwork === 'custom' ? 'sandboxnet' : strNetwork,
            fetch
          );

          if (contractJSON) {
            for (let i = 0, x = contractJSON.length; i < x; i++) {
              let [url, _hash, contentType] = contractJSON[i];
              // TODO: Line up contentType with claims keys to make this less ugly.
              if (contentType === 'CoreProfile') {
                localClaims.TezosControl.url = url;
                loadCoreProfile(localClaims);
              }

              if (contentType === 'TwitterVerification') {
                localClaims.TwitterControl.url = url;
                loadTwitterProfile(localClaims);
              }
              claimsStream.set(localClaims);
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
    networkStr.set('sandboxnet');
    strNetwork = 'custom';

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

  wallet.set(newWallet);
  try {
    await newWallet.requestPermissions(requestPermissionsInput);
    localKepler = new Kepler(
      keplerInstance,
      await authenticator(newWallet.client)
    );
    const Tezos = new TezosToolkit(urlNode);
    Tezos.addExtension(new Tzip16Module());
    Tezos.setWalletProvider(newWallet);
  } catch (e) {
    alert.set({
      message: e.message || JSON.stringify(e),
      variant: 'error',
    });

    throw e;
  }
};
