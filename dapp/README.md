# Tezos Public Profiles

## Installation

Compile DIDKit to WASM for browser use. Under `didkit/lib/web`, run:
```bash
wasm-pack build --target web --out-dir pkg/wasm
npm --prefix loader/wasm install
npm --prefix loader/wasm run build
```

Then:
```bash
npm install
npm run build
```
> For development purposes you can use `npm run dev`.
