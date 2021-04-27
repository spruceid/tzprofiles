import { Writable, writable } from 'svelte/store';
import * as contractLib from 'tezospublicprofiles';

export let alert: Writable<{
  message: string;
  variant: 'error' | 'warning' | 'success' | 'info';
}> = writable<{
  message: string;
  variant: 'error' | 'warning' | 'success' | 'info';
}>(null);

export let claims: Writable<any> = writable({
  BasicProfile: false,
  TwitterProfile: false,
});

let bcdAddress: string = 'https://api.better-call.dev';
let node: string = 'mainnet';

export const selectedNetwork: Writable<string> = writable(node);
selectedNetwork.subscribe((newNode) => {
  bcdAddress =
    newNode !== 'sandboxnet'
      ? 'https://api.better-call.dev'
      : 'http://localhost:14000';

  node = newNode;
});

export const search = async (wallet) => {
  if (wallet) {
    let found: any = false;
    try {
      found = await contractLib.retrieve_tpp_claims(
        bcdAddress,
        wallet,
        node,
        fetch
      );
    } catch (err) {
      alert.set({
        message: err.message || 'Network error',
        variant: 'error',
      });
      console.error(err);
      return;
    }

    if (found) {
      let tripleClaims = found;
      let nextClaims = {};
      for (let i = 0, n = tripleClaims.length; i < n; i++) {
        let [url, hash, key] = tripleClaims[i];
        nextClaims[key] = {
          url,
          hash,
          content: null,
          errorMessage: '',
        };
      }

      claims.set(nextClaims);
      return;
    }
  }

  alert.set({
    message: `No contract found for ${wallet}`,
    variant: 'error',
  });
};
