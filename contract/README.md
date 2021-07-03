# Tezos Profiles Smart Contract Registry

This smart-contract is a registry of personal claims (meaning every user has to
originate it).

## Local Environment
Requires [Docker](https://www.docker.com/get-started).

For development purposes, a full-fledged local environment is provided. It
contains a sandbox Tezos node, better-call.dev API, and the likes. To use it:
```bash
docker-compose -f sandbox-docker.yml up -d
```

## CLI

### Installation
```bash
npm i
```

### Usage
Deploy with tezos blockchain via the CLI
```bash
node cli/cli.js originate --secret <secret> --url <local node or mainnet url>
```

To see all possible usages and parameters, you can refer to the CLI's help:
```bash
$ node cli/cli.js --help
cli.js [command]

Commands:
  cli.js originate       Deploy Tezos Public Profiles smart contract.
  cli.js add-claims      Add a claim.
  cli.js remove-claims   Remove a claim.
  cli.js get-claims      Get claims.
  cli.js get-subject     Get the subject for a Tezos Public Profile smart
                         contract.
  cli.js resolve-tzp     Get the TZP address for a Tezos Wallet address.
  cli.js resolve-claims  Get the TZP claims for a Tezos Wallet address.

Options:
      --version          Show version number                           [boolean]
  -u, --url              Tezos node.
                            [string] [default: "https://api.tez.ie/rpc/mainnet"]
  -n, --network          Tezos network.            [string] [default: "mainnet"]
  -f, --faucet_key_file  Path to a faucet key JSON file.                [string]
  -s, --secret           Secret key.                                    [string]
  -b, --tzkt_base        Base url for TzKT API endpoints
                               [string] [default: "https://api.mainnet.tzkt.io"]
  -k, --kepler_base      Base url for kepler API server
                             [string] [default: "https://kepler.tzprofiles.com"]
  -h, --help             Show help                                     [boolean]
```

## SDK
It is recommended to only use `TZProfilesClient`.

### Example: retrieve claims for an address
```javascript
const lib = require('tzprofiles');
const kepler = require('kepler-sdk');
const DIDKit = require('didkit-wasm-node');

const hashFunc = async (claimBody) => {
	return crypto.createHash("sha256").update(claimBody).digest().toString('hex');
}

let clientOpts = {
    tzktBase: "https://api.mainnet.tzkt.io",
    keplerClient: new kepler.Kepler(
        'https://kepler.tzprofiles.com'
    ),
    hashContent: hashFunc,
    nodeURL: "https://api.tez.ie/rpc/mainnet",
    signer: false,
    validateType: async (c, t) => {
        // Validate VC
        switch (t) {
            case "VerifiableCredential": {
                let verifyResult = await DIDKit.verifyCredential(c, '{}');
                let verifyJSON = JSON.parse(verifyResult);
                if (verifyJSON.errors.length > 0) throw new Error(verifyJSON.errors.join(", "));
                break;
            }
            default:
                throw new Error(`Unknown ClaimType: ${t}`);
        }
    }
};
let client = new lib.TZProfilesClient(clientOpts);
return await client.retrieve("tz1...");
```

## Smart Contract Code
The smart-contract code is written in LIGO (under `src/`), compiled to Michelson
and embedded in `lib/contract.ts`.
