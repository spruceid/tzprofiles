# Tezos Public Profiles Smart Contract Registry

This smart-contract is a registry of personal claims (meaning every user has to
originate it).

## CLI

### Installation
Compile DIDKit to WASM for Node.js use. Under `didkit/lib/web`, run:
```bash
$ wasm-pack build --target nodejs --out-dir pkg/node
```

### Usage
Deploy with tezos blockchain via the CLI
```bash
npm i
node cli/cli.js originate --secret <secret> --url <local node or mainnet url>
# TODO: show how to dump the list.
```

## SDK
Import the contract interactions as JS functions
(TODO: Add examples)

## Smart Contract Code
The literal smart-contract code written in LIGO, compiled to Michelson for use by `cli`/`lib`
