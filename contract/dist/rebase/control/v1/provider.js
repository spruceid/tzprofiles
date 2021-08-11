"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("rebase/lib/util");
const provider_1 = require("rebase/lib/hashref/storage/hash/tezos/control/provider");
const contract_1 = require("./contract/contract");
const storage_1 = require("../../storage");
const desync = util_1.util.default;
// TODO: Set
// const metadataUrl = '';
function operationCreate(storage) {
    return [storage_1.toStorage(storage), true];
}
function operationRemove(storage) {
    return [storage_1.toStorage(storage), false];
}
const operationsMap = {
    create: 'default',
    remove: 'default',
};
// TODO: Change LocationOpts to Network and derive the other two.
function toHashControl(metadataUrl, network, signer) {
    const config = {
        code: contract_1.contract,
        hashViewer: storage_1.hashViewer,
        network,
        metadataUrl,
        operations: operationsMap,
        screener: storage_1.screener,
        signer,
    };
    const fmt = {
        fromRawStorage: desync(storage_1.fromRawStorage),
        toStorage: desync(storage_1.toStorage),
        operations: {
            create: operationCreate,
            remove: operationRemove,
        },
    };
    return provider_1.hashControlFromSigner(config, fmt);
}
exports.default = toHashControl;
