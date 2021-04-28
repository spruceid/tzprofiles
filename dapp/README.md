# Tezos Public Profiles

## Installation

For local deployment, Kepler must be installed and running:
```bash
git clone https://github.com/spruceid/kepler
cd kepler
cargo build
cargo run
```

DIDKit must be cloned alongside the `tzprofiles` repository:

```bash
git clone https://github.com/spruceid/didkit
cd didkit
cargo build
```

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
