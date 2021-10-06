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
exports.toHashViewer = exports.toContentViewer = exports.storageFromIndexer = void 0;
const taquito = require("@taquito/taquito");
const tzip16 = require("@taquito/tzip16");
const axios_1 = require("axios");
const hasher_1 = require("../../hasher/hasher");
const tezos_1 = require("rebase/lib/hashref/storage/hash/tezos/tezos");
const provider_1 = require("rebase/lib/hashref/storage/content/kepler/view/provider");
const keplerBase = 'https://kepler.tzprofiles.com';
function storageFromIndexer(iRes) {
    return __awaiter(this, void 0, void 0, function* () {
        const s1 = yield Promise.all(iRes.valid.map((x) => __awaiter(this, void 0, void 0, function* () {
            const ref = x[0];
            const content = x[1];
            return [yield hasher_1.default(content), ref];
        })));
        const s2 = iRes.invalid.map((x) => {
            const ref = x[0];
            const hash = x[1];
            return [hash, ref];
        });
        return [s1.concat(s2)];
    });
}
exports.storageFromIndexer = storageFromIndexer;
function toContentViewer() {
    const f = provider_1.contentViewer(keplerBase);
    return (ref) => __awaiter(this, void 0, void 0, function* () {
        const s = yield f(ref);
        return JSON.parse(s);
    });
}
exports.toContentViewer = toContentViewer;
// This configures a PublicClient which screens for a given owners contracts for
// a specific one given by the screener.
function toHashViewer(
// TODO: This var is used to be set by the hash viewer. Instead, make storage have a "data" result as well.
// TODO: Replace with handling of multiple contracts.
searchAddress, contractOperation, fmt, screener) {
    return (location) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        // TOOD: ADD BY INDEXER
        if (location.network === 'mainnet') {
            const body = {
                query: `query MyQuery { tzprofiles_by_pk(account: "${location.ownerAddress}") { invalid_claims valid_claims contract } }`,
                variables: null,
                operationName: 'MyQuery',
            };
            const res = yield axios_1.default.post('https://indexer.tzprofiles.com/v1/graphql', body);
            const data = res.data;
            if (!data) {
                throw new Error('No data found from indexer');
            }
            const base = (_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.tzprofiles_by_pk;
            if (!base) {
                throw new Error('Badly formatted data found from indexer');
            }
            const iRes = {
                address: base === null || base === void 0 ? void 0 : base.contract,
                valid: base === null || base === void 0 ? void 0 : base.valid_claims,
                invalid: base === null || base === void 0 ? void 0 : base.invalid_claims,
            };
            searchAddress = iRes.address;
            return storageFromIndexer(iRes);
        }
        const tzKit = new taquito.TezosToolkit(location.nodeUrl);
        tzKit.addExtension(new tzip16.Tzip16Module());
        const addressList = yield tezos_1.contractAddressesFromOwner(0, location.ownerAddress, location.tzktBase);
        const storageList = [];
        for (let i = 0, n = addressList.length; i < n; i += 1) {
            const address = addressList[i];
            // for now, agreeing to disagree with no await in a loop here.
            // TODO: something else?
            /* eslint-disable no-await-in-loop */
            if (address && (yield screener(address, tzKit, false))) {
                searchAddress = address;
                const contract = yield tzKit.contract.at(address, tzip16.tzip16);
                const views = yield contract.tzip16().metadataViews();
                const op = views[contractOperation];
                if (!op) {
                    // be more descriptive?
                    throw new Error('Could not read storage for contract ${}');
                }
                storageList.push(fmt(yield op().executeView()));
            }
        }
        return storageList;
    });
}
exports.toHashViewer = toHashViewer;
