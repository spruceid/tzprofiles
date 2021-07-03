# Tezos Profiles API

## Usage

```bash
# Retrieve valid claims on mainnet
$ curl "https://api.tzprofiles.com/tz1LMChSoDrZK8fFYmewVYnYe7q6tn43zFQs"
# You can also specify an other network
$ curl "https://api.tzprofiles.com/tz1LMChSoDrZK8fFYmewVYnYe7q6tn43zFQs/edonet"
# And retrieve claims that failed validation
$ curl "https://api.tzprofiles.com/tz1LMChSoDrZK8fFYmewVYnYe7q6tn43zFQs?invalid=true"
# Or retrieve all of them
$ curl "https://api.tzprofiles.com/tz1LMChSoDrZK8fFYmewVYnYe7q6tn43zFQs?invalid=true&valid=true"
# It also work with the profile contract directly
$ curl "https://api.tzprofiles.com/KT1KsmdYxuJHCMqLRX1PH7JJeXvXaMeicEa7"
```

## Installation

### Docker
```bash
$ docker run -p 8080:8080 --restart always -d ghcr.io/spruceid/tzp_api:latest
```

### From Source
```bash
npm i
node index.js
```
> It listens to port 8080.
