# Tezos Public Profiles Smart Contract Registry

This smart-contract is a registry of personal claims (meaning every user has to
originate it).

## Local Environment
Requires [Docker](https://www.docker.com/get-started).

For development purposes, a full-fledged local environment is provided. It
contains a sandbox Tezos node, better-call.dev API, and the likes. To use it:
```bash
docker-compose -f bcd-sandbox.yml up -d
```

## CLI

### Installation
Compile DIDKit to WASM for Node.js use. Under `didkit/lib/web`, run:
```bash
wasm-pack build --target nodejs --out-dir pkg/node
```

Then, in this directory:
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
  cli.js originate     Deploy Tezos Public Profiles smart contract.
  cli.js add-claim     Add a claim.
  cli.js remove-claim  Remove a claim.
  cli.js get-claims    Get claims.
  cli.js get-subject   Get the subject for a Tezos Public Profile smart
                       contract.
  cli.js resolve-tpp   Get the TPP for a Tezos address.

Options:
      --version          Show version number                           [boolean]
  -u, --url              Tezos node.
                            [string] [default: "https://api.tez.ie/rpc/mainnet"]
  -n, --network          Tezos network.            [string] [default: "mainnet"]
  -f, --faucet_key_file  Path to a faucet key JSON file.                [string]
  -s, --secret           Secret key.                                    [string]
  -b, --bcd_url          better-call.dev API endpoint
                              [string] [default: "https://api.better-call.dev/"]
  -h, --help             Show help                                     [boolean]
```

## SDK
Import the contract interactions as JS functions
(TODO: Add examples)

## Smart Contract Code
The literal smart-contract code written in LIGO, compiled to Michelson for use
by `cli`/`lib`
