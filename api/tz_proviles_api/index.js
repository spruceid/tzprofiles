// unknown object, so can't be used as a constructor
// global['XMLHttpRequest'] = {};
// require('xhr2');
// "Cannot read property 'protocol' of undefined" in sendHxxpRequest
global['XMLHttpRequest'] = require('xhr2-cookies').XMLHttpRequest;

const tzprofiles = require("tzprofiles");
const kepler = require("kepler-sdk");
import {Router} from 'itty-router';

const router = Router();

router.get('/:address', async ({params}) => {
  const content = await retrieve(params.address, "mainnet");
  return new Response(JSON.stringify(content))
})

router.get('/:address/:network', async ({params}) => {
  const content = await retrieve(params.address, params.network);
  return new Response(JSON.stringify(content))
})

function network_string(network) {
  if (network === "edonet") {
    return "edo2net";
  }
  return network
}

async function retrieve(address, network) {
  let localKepler = new kepler.Kepler(
    "https://kepler.tzprofiles.com",
    null
  );

  let bcdOpts = {
    base: "https://api.better-call.dev",
    network: network_string(network),
    version: 1
  };

  let clientOpts = {
    betterCallDevConfig: bcdOpts,
    keplerClient: localKepler,
    hashContent: null,
    nodeURL: "https://api.tez.ie/rpc/" + network,
    signer: false,
    validateType: async (c, t) => {
      // Validate VC
      switch (t) {
        case "VerifiableCredential": {
          await fetch("https://vc_verifier.rebase-verifier.workers.dev", {body: c});
          break;
        }
        default:
          throw new Error(`Unknown ClaimType: ${t}`);
      }
    }
  };

  let client = new tzprofiles.TZProfilesClient(clientOpts);

  return await client.retrieve(address);
}

router.all('*', () => new Response('Not Found.', {status: 404}));

addEventListener('fetch', event =>
  event.respondWith(
    router
      .handle(event.request)
      .catch(e => {console.error(e, e.stack); return new Response(e, {status: 500})})
  )
)
