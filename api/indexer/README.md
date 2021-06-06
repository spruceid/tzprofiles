# Tezos Profiles Indexer

Allows for faster queries of tzprofiles claims by retrieving and validating
them only once. Built with DipDup.

## Installation

### Docker (recommended)

Use the [docker-compose file](../docker-compose.yml).

### Manual
Install dependencies with:
```bash
poetry install
```

Then run the indexer with:
```bash
dipdup run
```

## Usage

For now, only a GraphQL API is available at `/v1/graphql` (to be used with
POST). Following are a couple examples of queries.

Retrieve the profile for an account:
```json
// Query (escape line returns in strings)
{
  "query":"query MyQuery {
      tzprofiles_by_pk(account: \"tz1XUUF8dS4CxkdNE26DX8SEUPTZnt5t97Tt\") {
        invalid_claims
          valid_claims
          contract
      }
    }",
  "variables":null,
  "operationName":"MyQuery"
}

// Response
{
  "data": {
    "tzprofiles_by_pk": {
      "valid_claims": [
        [
          "kepler://v0:...",
          "...",
          "VerifiableCredential"
        ],
        [
          "kepler://v0:...",
          "...",
          "VerifiableCredential"
        ]
      ],
      "invalid_claims": [],
      "contract": "KT1AUeTZ4eyGWpMjxu7b8VLZA8uHnNcwZ4ZF"
    }
  }
}
```

Retrieve the total number of profiles and their account:
```json
// Query (escape line returns in strings)
{
  "query":"query MyQuery {
      tzprofiles_aggregate(distinct_on: account) {
        aggregate {
          count(columns: account)
        }
        nodes {
          account
          contract
        }
      }
    }",
  "variables":null,
  "operationName":"MyQuery"
}

// Response
{
  "data": {
    "tzprofiles_aggregate": {
      "aggregate": {
        "count": 13
      },
      "nodes": [
        ...
      ]
    }
  }
}
```

## Architecture

```
         ┌──────────┐       ┌────┐
         │Blockchain◄───────┤TzKT│
         └─────▲────┘       └──▲─┘
               │               │
               │       ┌───────┼──────┐
               │       │       │      │
┌──────┐     ┌─┴─┐     │  ┌────┴───┐  │
│Kepler◄─────┤API◄─────┼──┤DipDup +│  │
└──────┘     └───┘     │  │Handlers│  │
                       │  └────┬───┘  │
                       │       │      │
                       │ ┌─────▼────┐ │
                       │ │PostgresQL│ │
                       │ └─────▲────┘ │
                       │       │      │
                       │   ┌───┴──┐   │
                       │   │Hasura│   │
                       │   └──▲───┘   │
                       │      │       │
                       └──────┼───────┘
                            Indexer
                              │
                              │

                              o
                             -|-
                             / \
```

For simplicity, the indexer relies on the [API service](../service) to fetch the
claims and validate them with DIDkit.

## Limitations

### Failures in handler

Because Tezos profiles have an off-chain component (HTTP for now), it means the
processing of an origination/update of a profile can fail whilst fetching the
claims. With the current implementation, the indexer will simply store an empty
list of claims and stay that way until the profile is updated or the indexer
restarted.

### Off-chain modifications

Claims are stored off-chain but the indexer only listens to updates to the
smart-contract. For example, if a claim is deleted in Kepler, and the user does
not remove the claim from the list in the contract -- the indexer will continue
to serve the claim.
