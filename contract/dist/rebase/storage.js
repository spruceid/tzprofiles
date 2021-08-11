"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashViewer = exports.screener = exports.toStorage = exports.fromRawStorage = void 0;
const provider_1 = require("rebase/lib/hashref/storage/hash/tezos/view/provider");
function fromRawStorage(raw) {
    return raw.map((x) => {
        return [x[1], x[0]];
    });
}
exports.fromRawStorage = fromRawStorage;
function toStorage(storage) {
    return storage.map((x) => {
        const result = [x[1], x[0], 'VerifiableCredential'];
        return result;
    });
}
exports.toStorage = toStorage;
exports.screener = provider_1.metadataInterfaceScreener('TZIP-024');
exports.hashViewer = provider_1.ownerViewer('GetClaims', fromRawStorage, exports.screener);
