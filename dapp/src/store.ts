import { BeaconWallet } from '@taquito/beacon-wallet';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { TezosToolkit } from '@taquito/taquito';
import { Tzip16Module } from '@taquito/tzip16';
import NetworkType from 'enums/NetworkType';
import BeaconEvent from 'enums/BeaconEvent';
import { loadDIDKit } from 'didkit-wasm/didkit-loader';
import * as contractLib from '../../contract/lib/lib';
// TODO: get this style of import working
// import * as contractLib from 'tezospublicprofiles';
import { PersonOutlined, TwitterIcon } from 'components';
import SvelteComponentDev from '*.svelte';
// TODO fix export in kepler :facepalm:
import { Kepler, authenticator } from 'kepler-client/dist';

// TODO: Change this to kepler, then remove.
export const createJsonBlobUrl = async (obj) => {
  const dummyOrbit = 'uAYAEHiB_A0nLzANfXNkW5WCju51Td_INJ6UacFK7qY6zejzKoA';
  if (localKepler) {
    return dummyOrbit + "/" + await localKepler.put(dummyOrbit, obj)
  }

  const blob = new Blob([JSON.stringify(obj)], {
    type: 'application/json',
  });
  return URL.createObjectURL(blob);
};

export const loadJsonBlob = async (url: string): Promise<any> => {
  if (localKepler) {
    const [orbit, cid] = url.split('/');
    return await localKepler.get(orbit, cid)
  }
  return await fetch(url)
    .then((r) => r.blob())
    .then((b) => b.text())
    .then((s) => JSON.parse(JSON.parse(s)));
};

export const loadCoreProfile = async ({
  TezosControl: { url },
}: ClaimMap): Promise<{
  alias: string;
  description: string;
  logo: string;
}> => {
  if (url) {
    const { credentialSubject } = await loadJsonBlob(url);
    const { alias, description, logo } = credentialSubject;
    return {
      alias,
      description,
      logo,
    };
  } else {
    return {
      alias: '',
      description: '',
      logo: '',
    };
  }
};

export const loadTwitterProfile = async ({
  TwitterControl: { url },
}: ClaimMap): Promise<{
  handle: string;
}> => {
  if (url) {
    const { credentialSubject } = await loadJsonBlob(url);
    const { sameAs } = credentialSubject;
    const handle = sameAs.replace('https://twitter.com/', '');
    return { handle };
  } else {
    return { handle: '' };
  }
};

export let DIDKit = writable(null);
export const userData = writable(null);
export const contractAddress: Writable<string> = writable<string>(null);
export const dappUrl = 'http://localhost:8080';
export const witnessUrl = 'http://localhost:8787';
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
    display: 'Twitter Account Control',
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
    display: 'Tezos Wallet Control',
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
let localNetworkStr: string;
let localWallet: BeaconWallet;
let localKepler: Kepler;

claimsStream.subscribe((x) => {
  localClaimsStream = x;
});
contractAddress.subscribe((x) => {
  localContractAddress = x;
});
DIDKit.subscribe((x) => {
  localDIDKit = x;
});
networkStr.subscribe((x) => {
  localNetworkStr = x;
});
wallet.subscribe((x) => {
  localWallet = x;
});

const hashFunc = async (claimString: string): Promise<ArrayBuffer> => {
  let encodedString = new TextEncoder().encode(claimString);
  return await crypto.subtle.digest('SHA-256', encodedString);
};

export const originate = async (): Promise<void> => {
  console.log('In originate');
  if (!localWallet) {
    throw new Error('No wallet detected');
  }

  if (!localNetworkStr) {
    throw new Error('No contractAddress detected');
  }

  if (!localDIDKit || !localDIDKit.verifyCredential) {
    throw new Error('No DIDKit detected');
  }

  console.log('Passed error handling');
  let claimsKeys = Object.keys(localClaimsStream);

  let urlList: string[] = []

  for (let i = 0, x = claimsKeys.length; i < x; i++) {
    let claimKey = claimsKeys[i];
    let claim = localClaimsStream[claimKey];
    if (claim.url) {
      urlList.push(claim.url);
    }
  }

  console.log('Passed URL Push');
  if (urlList.length < 1) {
    throw new Error('No claim urls found');
  }

  console.log('URLS found:', urlList.join(', '));
  let opts = {
    useWallet: true,
    wallet: localWallet,
  };

  console.log('about to originate....');
  let contractAddr = await contractLib.originate(
    opts,
    localNetworkStr,
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

  if (!localNetworkStr) {
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
    localNetworkStr,
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

  if (!localNetworkStr) {
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
    localNetworkStr,
    localDIDKit.verifyCredential,
    hashFunc,
    fetch
  );
};

loadDIDKit('/didkit_wasm_bg.wasm').then(DIDKit.set);

let urlNode = '';
let strNetwork = '';
let urlBetterCallDev = '';
let localClaims = {};

claimsStream.subscribe((claims) => {
  localClaims = claims;
});

wallet.subscribe((wallet) => {
  if (wallet) {
    wallet.client.subscribeToEvent(
      BeaconEvent.PERMISSION_REQUEST_SUCCESS,
      async (data) => {
        console.log(data);
        userData.set(data);

        loadingContracts.set(true);
        try {
          let contractJSON = await contractLib.retrieve_tpp(
            urlBetterCallDev,
            'edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn',
            strNetwork,
            fetch
          );

          if (contractJSON) {
            console.log('store::load_contracts::', contractJSON);
            for (let i = 0, x = contractJSON.length; i < x; i++) {
              let [url, _hash, contentType] = contractJSON[i];
              if (localClaims[contentType]) {
                localClaims[contentType].url = url;
              }
              claimsStream.set(localClaims);
            }
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
    // TODO parameterise kepler URL
    localKepler = new Kepler('https://kepler.tzprofiles.com', await authenticator(newWallet.client));
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
