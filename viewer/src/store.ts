import { Writable, writable } from 'svelte/store';
import * as contractLib from 'tzprofiles';
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

const hashFunc = async (claimString: string): Promise<string> => {
  let encodedString = new TextEncoder().encode(claimString);
  let buf = await crypto.subtle.digest('SHA-256', encodedString);
  return [...new Uint8Array (buf)]
        .map (b => b.toString (16).padStart (2, "0"))
        .join ("");
};
export const search = async (wallet) => {
  if (wallet) {
    try {
      let bcdOpts: contractLib.BetterCallDevOpts = {
        base: bcdAddress,
        network: node as contractLib.BetterCallDevNetworks,
        version: 1 as contractLib.BetterCallDevVersions
      };

      let clientOpts: contractLib.TZProfilesClientOpts = {
        betterCallDevConfig: bcdOpts,
        keplerClient: localKepler,
        hashContent: hashFunc,
        nodeURL: "undefined",
        signer: false,
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
      }

      let contractClient = new contractLib.TZProfilesClient(clientOpts);

      let found = await contractClient.retrieve(wallet);
      if (found) {
        contract.set(found.address);
        // NOTE: We are not dealing with invalid claims in the UI
        // TODO: Handle invalid claims
        const resolvedClaims: any = await Promise.all(
          found.valid.map((profile) =>
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
