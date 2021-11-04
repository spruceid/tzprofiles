import fetch, { Headers, Request, Response } from 'node-fetch';
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
global.fetch = fetch;

import cors from 'cors';
import express from 'express';
import tzprofiles from '@spruceid/tzprofiles';
import kepler from "kepler-sdk";
import didkit from 'didkit-wasm-node';
import crypto from 'crypto';

const port = 8080;
const app = express();
app.use(cors());

app.get('/_healthz', async function(_, res, __) {
    res.send(true)
})

app.get('/:address', async function(req, res, next) {
    try {
        const content = await retrieve(req.params.address, "mainnet", req.query);
        res.send(content)
    } catch (err) {
        next(err)
    }
})

app.get('/:address/:network', async function(req, res, next) {
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

export const claimTypeFromVC = (vc) => {
    if (!vc?.type || !Array.isArray(vc.type)) {
        return false;
    }
    for (let i = 0, n = vc.type.length; i < n; i++) {
        let type = vc.type[i];
        switch (type) {
            case 'BasicProfile':
                return 'basic';
            case 'EthereumControl':
            case 'EthereumAddressControl':
                return 'ethereum';
            case 'TwitterVerification':
                return 'twitter';
            case 'DiscordVerification':
                return 'discord';
            case 'DnsVerification':
                return 'dns';
            case 'GitHubVerification':
                return 'github';
            default:
        }
    }
    return false;
};

async function retrieve(address, network, query) {
    const tzktEndpoint = `https://api.${network_string(network)}.tzkt.io`;
    let pkh = '';
    if (address.toLowerCase().startsWith("kt1")) {
        pkh = await fetch(`${tzktEndpoint}/v1/contracts/${address}`).then(res => res.json()).then(json => json.creator.address)
    } else {
        pkh = address
    }
    const hashFunc = async (claimBody) => {
        return crypto.createHash("sha256").update(claimBody).digest().toString('hex');
    }
    let localKepler = new kepler.Kepler(
        "https://kepler.tzprofiles.com",
        null
    );
    let clientOpts = {
        tzktBase: tzktEndpoint,
        keplerClient: localKepler,
        hashContent: hashFunc,
        nodeURL: `https://${network}.api.tez.ie`,
        signer: false,
        validateType: async (c, t) => {
            // Validate VC
            switch (t) {
                case "VerifiableCredential": {
                    let verifyResult = await didkit.verifyCredential(c, "{}");
                    let verifyJSON = JSON.parse(verifyResult);
                    if (verifyJSON.errors.length > 0) throw new Error(`Verifying ${c}: ${verifyJSON.errors.join(", ")}`);
                    let vc = JSON.parse(c);
                    let type_ = claimTypeFromVC(vc);
                    switch (type_) {
                        case 'basic':
                        case 'twitter':
                        case 'discord':
                        case 'dns':
                        case 'github':
                            if (vc.credentialSubject.id != `did:pkh:tz:${pkh}`) {
                                throw new Error(`Credential subject not the profile's owner.`)
                            }
                            break;
                        case 'ethereum':
                            if (vc.credentialSubject.sameAs != pkh) {
                                throw new Error(`Credential subject not the profile's owner.`)
                            }
                            break;
                        default:
                    }
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
        res = { valid: [], invalid: [] }
    }

    res.valid.map(x => x.push(JSON.parse(x[1]).issuer))

    // TODO better UX for both the query and the results
    if (query.invalid) {
        if (!query.valid) {
            return res.invalid;
        }
        return { valid: res.valid, invalid: res.invalid };
    }
    return res.valid;
}

app.use(function(req, res, next) {
    res.status(404).send()
})

app.use(function(err, req, res, next) {
    console.error(err)
    res.status(500).send()
})

app.listen(port)
