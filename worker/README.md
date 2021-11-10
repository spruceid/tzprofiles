# Tezos Profiles Witness

A Cloudflare Worker to witness public attestations of ownership of a Tezos account.

## Deploy

Requires [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update#additional-installation-instructions).

You need a Cloudflare account, and the Account ID needs to go in
the `wrangler.toml`.

The worker needs two things: the private key to issue the VC after verifying the
tweet, and an API token for the relevant social APIs. You can add these as secrets with:

```bash
wrangler secret put TZPROFILES_ME_PRIVATE_KEY
wrangler secret put TWITTER_BEARER_TOKEN
wrangler secret put DISCORD_AUTHORIZATION_TOKEN
```

> The private key is expected to be a JWK. You can generate one with
> `didkit generate-ed25519-key`.

```bash
wrangler publish
```

> For development, you should use `wrangler dev`.

## Test

```bash
cargo test
```
