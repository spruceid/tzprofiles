# Tezos Profiles

## Installation

For local deployment, you will need a local instance of
[Kepler](https://github.com/spruceid/kepler/) and the [Witness
worker](../worker).

If you want to use their production instances, you need to set the following
environment variables:
```bash
export KEPLER_URL=https://kepler.tzprofiles.com
export WITNESS_URL=https://witness.tzprofiles.com
```

To run:
```bash
npm install
npm run build
```
> For development purposes you can use `npm run dev`.

## Deployment
It is currently integrated with Cloudflare Pages. The `HEAD` of `main` is what
is available on tzprofiles.com -- and otherwise a specific deployment is
available for every commit of every branch.
