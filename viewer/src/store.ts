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

let localKepler: Kepler<any> = new Kepler(
  keplerInstance,
  async (orbit, cid, action) => ''
);

let bcdAddress: string = 'https://api.better-call.dev';
let node: string = 'mainnet';

export const selectedNetwork: Writable<string> = writable(node);
selectedNetwork.subscribe((newNode) => {
  bcdAddress =
    newNode !== 'localhost'
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
        const [claimContract, ...profiles] = found;
        contract.set(claimContract);
        const resolvedClaims: any = await Promise.all(
          profiles.map((profile) =>
            localKepler
              .resolve(profile[0], false)
              .then((r) => r.json())
              .then((claim) => (Array.isArray(claim) ? claim[0] : claim))
          )
        );
        resolvedClaims.forEach((claim) => {
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
