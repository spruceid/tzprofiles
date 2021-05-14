const fetch = require('node-fetch');
global.Headers = fetch.Headers;
global.Request = fetch.Request;
global.Response = fetch.Response;
global.fetch = fetch;

const express = require('express');
const tzprofiles = require('tzprofiles');
const kepler = require("kepler-sdk");
const didkit = require('didkit-wasm-node');
const crypto = require('crypto');

const port = 8080;
const app = express();

app.get('/:address', async function (req, res) {
    const content = await retrieve(req.params.address, "mainnet", req.query);
    res.send(content)
})

app.get('/:address/:network', async function (req, res) {
    const content = await retrieve(req.params.address, req.params.network, req.query);
    res.send(content)
})

function network_string(network) {
    if (network === "edonet") {
        return "edo2net";
    }
    return network
}

async function retrieve(address, network, query) {
    const hashFunc = async (claimBody) => {
        return crypto.createHash("sha256").update(claimBody).digest().toString('hex');
    }
    let localKepler = new kepler.Kepler(
        "https://kepler.tzprofiles.com",
        null
    );
    let bcdOpts = {
        base: "https://api.better-call.dev",
        network: network_string(network),
        version: 1
    };
    let clientOpts = {
        betterCallDevConfig: bcdOpts,
        keplerClient: localKepler,
        hashContent: hashFunc,
        nodeURL: "https://api.tez.ie/rpc/" + network,
        signer: false,
        validateType: async (c, t) => {
            // Validate VC
            switch (t) {
                case "VerifiableCredential": {
                    let verifyResult = await didkit.verifyCredential(c, "{}");
                    let verifyJSON = JSON.parse(verifyResult);
                    if (verifyJSON.errors.length > 0) throw new Error(`Verifying ${c}: ${verifyJSON.errors.join(", ")}`);
                    break;
                }
                default:
                    throw new Error(`Unknown ClaimType: ${t}`);
            }
        }
    };
    let client = new tzprofiles.TZProfilesClient(clientOpts);

    let res = await client.retrieve(address);
    if (res === false) {
        return [];
    }

    // TODO better UX for both the query and the results
    if (query.invalid) {
        if (!query.valid) {
            return res.invalid;
        }
        return {valid: res.valid, invalid: res.invalid};
    }
    return res.valid;
}

app.use(function (req, res, next) {
    res.status(404).send()
})

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send(err)
})

app.listen(port)
