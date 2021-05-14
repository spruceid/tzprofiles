# Tezos Profiles API

## Usage

```bash
# Retrieve valid claims on mainnet
$ curl "https://api.tzprofiles.com/tz1giDGsifWB9q9siekCKQaJKrmC9da5M43J"
# You can also specify an other network
$ curl "https://api.tzprofiles.com/tz1giDGsifWB9q9siekCKQaJKrmC9da5M43J/edonet"
# And retrieve claims that failed validation
$ curl "https://api.tzprofiles.com/tz1giDGsifWB9q9siekCKQaJKrmC9da5M43J?invalid=true"
# Or retrieve all of them
$ curl "https://api.tzprofiles.com/tz1giDGsifWB9q9siekCKQaJKrmC9da5M43J?invalid=true&valid=true"
```

## Installation

### Docker
```bash
$ docker run -p 15000:8080 --restart always -d ghcr.io/spruceid/tzp_api:0.1.0
```

### From Source
```bash
npm i
node index.js
```
> It listens to port 8080.
