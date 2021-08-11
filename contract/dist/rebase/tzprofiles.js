"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeControlOpts = exports.makeControlClient = exports.makeHashControl = exports.makeContentControl = exports.viewerOpts = exports.makeViewClient = exports.makeHashViewer = exports.makeContentViewer = exports.ControlClient = void 0;
const taquito = require("@taquito/taquito");
const tzip16 = require("@taquito/tzip16");
const v0Auth = require("./control/v0/provider");
const v1Auth = require("./control/v1/provider");
const ControlClient_1 = require("rebase/lib/hashref/client/ControlClient");
const ViewClient_1 = require("rebase/lib/hashref/client/ViewClient");
const storage_1 = require("./storage");
const hasher_1 = require("./hasher/hasher");
const provider_1 = require("rebase/lib/hashref/storage/hash/tezos/control/provider");
const tezos_1 = require("rebase/lib/hashref/storage/hash/tezos/tezos");
const provider_2 = require("./view/v0/provider");
const provider_3 = require("rebase/lib/hashref/storage/content/kepler/view/provider");
const provider_4 = require("rebase/lib/hashref/storage/content/kepler/control/tezos/provider");
class ControlClient extends ControlClient_1.default {
    constructor(hasher, contentControl, hashControl) {
        super(hasher, contentControl, hashControl);
    }
    getAddr() {
        let x = this.hashControl;
        return x.contractAddr();
    }
}
exports.ControlClient = ControlClient;
const metadataUrl = 'https://tzprofiles.com/tzip016_metadata.json';
function makeContentViewer(domain) {
    const f = provider_3.contentViewer(domain);
    return (ref) => __awaiter(this, void 0, void 0, function* () { return JSON.parse(yield f(ref)); });
}
exports.makeContentViewer = makeContentViewer;
function makeHashViewer(searchAddress) {
    return provider_2.toHashViewer(searchAddress, 'GetClaims', storage_1.fromRawStorage, storage_1.screener);
}
exports.makeHashViewer = makeHashViewer;
function makeViewClient(opts) {
    return new ViewClient_1.default(hasher_1.default, makeContentViewer(opts.keplerDomain), makeHashViewer(opts.searchAddress));
}
exports.makeViewClient = makeViewClient;
function viewerOpts(network, ownerAddress) {
    let opts = provider_1.locationOptsFromNetwork(network);
    return {
        network: opts.network,
        tzktBase: opts.tzktBase,
        nodeUrl: opts.nodeUrl,
        ownerAddress,
    };
}
exports.viewerOpts = viewerOpts;
// TODO: Accept Signer instead of BeaconWallet.
function makeContentControl(wallet, domain) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield provider_4.contentControl(wallet, domain);
        return {
            id: client.id,
            create: (contentList) => {
                return client.create(contentList);
            },
            read: (ref) => __awaiter(this, void 0, void 0, function* () {
                let result = JSON.parse(yield client.read(ref));
                console.log(result);
                return result;
            }),
            remove: client.remove,
            update: (newContentList, oldRefList) => __awaiter(this, void 0, void 0, function* () {
                if (client.update) {
                    return yield client.update(newContentList, oldRefList);
                }
                yield client.remove(oldRefList);
                return client.create(newContentList);
            }),
        };
    });
}
exports.makeContentControl = makeContentControl;
function makeHashControl(signer, network) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nodeUrl, tzktBase } = provider_1.locationOptsFromNetwork(network);
        const tzKit = new taquito.TezosToolkit(nodeUrl);
        tzKit.addExtension(new tzip16.Tzip16Module());
        yield tezos_1.loadSigner(signer, tzKit);
        let pkh;
        const t = signer.type;
        switch (signer.type) {
            case 'key_file':
                pkh = yield tzKit.signer.publicKeyHash();
                break;
            case 'secret':
                pkh = yield tzKit.signer.publicKeyHash();
                break;
            case 'wallet':
                pkh = yield signer.wallet.getPKH();
                break;
            default:
                throw new Error(`Unknown signer type ${t}`);
        }
        const addressList = yield tezos_1.contractAddressesFromOwner(0, pkh, tzktBase);
        let contract = false;
        for (let i = 0, n = addressList.length; i < n; i += 1) {
            const address = addressList[i];
            if (address) {
                // for now, agreeing to disagree with no await in a loop here.
                // TODO: something else when supporting multicontract
                /* eslint-disable no-await-in-loop */
                contract = yield storage_1.screener(address, tzKit, signer.type === 'wallet');
                if (contract) {
                    break;
                }
            }
        }
        if (!contract) {
            return v1Auth.default(metadataUrl, network, signer);
        }
        const entrypoints = Object.keys(contract.methods);
        if (entrypoints.length === 1 && entrypoints.includes('default')) {
            return v1Auth.default(metadataUrl, network, signer);
        }
        if (entrypoints.includes('addClaims') && entrypoints.includes('removeClaims')) {
            return v0Auth.default(metadataUrl, network, signer);
        }
        throw new Error('Contract found by screener did not match entrypoint expectations');
    });
}
exports.makeHashControl = makeHashControl;
function makeControlClient(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        return new ControlClient(hasher_1.default, yield makeContentControl(opts.signer, opts.keplerDomain), yield makeHashControl({ type: 'wallet', wallet: opts.signer }, opts.network));
    });
}
exports.makeControlClient = makeControlClient;
function makeControlOpts(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield makeContentControl(opts.signer, opts.keplerDomain);
        const hash = yield makeHashControl({ type: 'wallet', wallet: opts.signer }, opts.network);
        const clientId = `${hash.id}::${content.id}`;
        return {
            clientId,
            hasher: hasher_1.default,
            contentControl: content,
            hashControl: hash,
        };
    });
}
exports.makeControlOpts = makeControlOpts;
