# Tezos Profiles Smart Contract Registry

This portion of the repository includes:
* A smart contract (`/src`) written in [Religo]() and compiled to michelson which underlies Tezos Profiles but could also be repurposed for other content registry usecases.
* A docker-compose file (`bcd-sandbox.yml`) to assist in running a local sandbox to easily deploy and interact with the smart contract.
* A Typescript SDK (source: `/lib`, compiled: `/dist`) which facilitates easy, programmatic interactions with the smart contract featuring both a Tezos Profile specific implementation and a more general/configurable implementation to support alternate usecases.
* A node.js CLI (`/cli`) which utilizes the SDK for easy, terminal-based interactions with the smart contract.

## Architecture Overview:

The foundational smart contract requires / permits the following storage:
* An `owner`, the wallet that owns the smart contract (required at origination)
* Metadata TODO: Explain the relevance? (Is required?)
* A `contract_type` entry to allow the SDK to correctly identify the targeted smart contract. (required at origination)
* `claims` a set of triples which represent the content that contract attests to. (not required, but can be supplied at origination)

### Claims:

The primary purpose of the smart contract is to attest to the existence of certain content at certain references. To do this in a privacy preserving way, each claim is saved as a triple:
```javascript
[claim_reference: string, claim_hash: string, claim_type: string]
```

The reference is assumed to be something like a URL, though in Tezos Profiles, it defaults to a [kepler]() URI. The hash is a content hash of whatever following the reference will produce, the consistency of the hash is assured by allowing the application calling the SDK to supply the hashing function. The type is used to process the claim once retrieved. In Tezos Profiles, this defaults to "[VerifiableCredential]()".


This allows very little identifiable information to be stored on the public blockchain, but also creates the ability to point to tamper-proof instances of content. If the content retrieved from the given reference does NOT match the hashed content when processed with the same hashing function, then the end user knows that the content has been tampered with, and the attestation is false.

### Smart Contract Interactions / Entry Points:

The smart contract permits the following on-chain operations:

* Origination TODO: Work from here.


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
