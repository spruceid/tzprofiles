# Profile Smart Contract

## Cli

### Installation
Compile DIDKit to WASM for Node.js use. Under `didkit/lib/web`, run:
```bash
$ wasm-pack build --target nodejs --out-dir pkg/node
```

### Usage
Deploy with tezos blockchain via the CLI
```bash
cd tzid.me/contract/cli
npm i
node cli.js originate --secret <secret> --url <local node or mainnet url>
# TODO: show how to dump the list.
```

## Lib
Import the contract interactions as JS functions
(TODO: Add examples)

## Src
The literal smart-contract code written in Ligo, compiled to Michelson for use by `cli`/`lib`
