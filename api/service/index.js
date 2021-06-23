const fetch = require('node-fetch');
global.Headers = fetch.Headers;
global.Request = fetch.Request;
global.Response = fetch.Response;
global.fetch = fetch;

const cors = require('cors');
const express = require('express');
const tzprofiles = require('tzprofiles');
const kepler = require("kepler-sdk");
const didkit = require('didkit-wasm-node');
const crypto = require('crypto');

const port = 8080;
const app = express();
app.use(cors());

app.get('/:address', async function (req, res, next) {
    try {
        const content = await retrieve(req.params.address, "mainnet", req.query);
        res.send(content)
    } catch (err) {
        next(err)
    }
})

app.get('/:address/:network', async function (req, res, next) {
    try {
        const content = await retrieve(req.params.address, req.params.network, req.query);
        res.send(content)
    } catch (err) {
        next(err)
    }
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
        nodeURL: `https://${network}.smartpy.io`,
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

    let res;
    if (address.toLowerCase().startsWith("kt1")) {
        res = await client.retrieveClaims(address);
    } else {
        res = await client.retrieve(address);
    }
    if (res === false) {
        res = {valid: [], invalid: []}
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
    console.error(err)
    res.status(500).send(err)
})

app.listen(port)
