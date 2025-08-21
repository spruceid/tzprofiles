> [!IMPORTANT]
> TzProfiles is now archived and no longer maintained.
>
> Over the past years, TzProfiles served as an early experiment in decentralized identity for the Tezos ecosystem. While it helped demonstrate what was possible, it has been in minimal maintenance mode for some time, with long-standing issues that prevented it from offering a good user experience. Meanwhile, the ecosystem has continued to evolve and moved on to other solutions.
>
> We are grateful to everyone who used and contributed to TzProfiles, and we hope it played a small role in inspiring what came next.

![tp header](/docs/tpheader.png)

[![](https://img.shields.io/badge/License-Apache--2.0-green)](https://github.com/spruceid/didkit/blob/main/LICENSE) [![](https://img.shields.io/twitter/follow/tzprofiles?label=Follow&style=social)](https://twitter.com/tzprofiles)

# Tezos Profiles

Tezos Profiles (TZP) is a web application that helps users regain control 
of their digital identity for use across platforms. It allows users 
to create portable verified profiles by demonstrating control over 
their public social media and by self-attesting information. These 
verified profiles are then linked to Tezos accounts, allowing any 
platform to resolve and establish trusted information to mitigate 
identity fraud.

This project is split into three components. A web app that end-users will
interact with, a worker that will act as a witness, and a smart contract to act
as a registry.

## Security Audits
Tezos Profiles has undergone the following security reviews:
- [March 14th, 2022 - Trail of Bits](https://github.com/trailofbits/publications/blob/master/reviews/SpruceID.pdf) | [Summary of Findings](https://blog.spruceid.com/spruce-completes-first-security-audit-from-trail-of-bits/)

## Web App (tzprofiles.com)
Refer to [dapp](dapp).

## Smart Contract and SDK
Refer to [contract](contract).

## Witness (witness.tzprofiles.com)
Refer to [worker](worker).

## Indexer/API (indexer.tzprofiles.com and api.tzprofiles.com)
Refer to [api](api).
