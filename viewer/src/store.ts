import { Writable, writable } from 'svelte/store';
import * as contractLib from 'tezospublicprofiles';
import { Kepler } from 'kepler-sdk';

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

let localClaims;

claims.subscribe((x) => (localClaims = x));

export let contract: Writable<string> = writable(null);

let keplerInstance: string = 'http://127.0.0.1:8000';

let localKepler: Kepler = new Kepler(
  keplerInstance,
  async (orbit, cid, action) => ''
);

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
      if (found) {
        const [claimContract, twitterProfile, basicProfile] = found;
        const [twitterOrbit, twitterCid] = twitterProfile[0]
          .split('/')
          .slice(-2);
        const [basicProfileOrbit, basicProfileCid] = basicProfile[0]
          .split('/')
          .slice(-2);
        contract.set(claimContract);
        localClaims.TwitterProfile = await localKepler.get(
          twitterOrbit,
          twitterCid,
          false
        );
        localClaims.BasicProfile = await localKepler.get(
          basicProfileOrbit,
          basicProfileCid,
          false
        );

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
  throw new Error(`No contract found for ${wallet}`)
};
