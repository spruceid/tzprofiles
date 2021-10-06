"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("rebase/lib/util");
const provider_1 = require("rebase/lib/hashref/storage/hash/tezos/control/provider");
const storage_1 = require("../../storage");
const desync = util_1.util.default;
function operationCreate(storage) {
    return storage_1.toStorage(storage);
}
function operationRemove(storage) {
    return storage_1.toStorage(storage);
}
const operationsMap = {
    create: 'addClaims',
    remove: 'removeClaims',
};
function toHashControl(metadataUrl, network, signer) {
    // We are not deploying new v0 contracts, so no code is given.
    const config = {
        code: '',
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
