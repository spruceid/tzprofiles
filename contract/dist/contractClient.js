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
exports.ContractClient = void 0;
// TODO: Restore once the wallet can be properly typed.
// import type { BeaconWallet } from "@taquito/beacon-wallet";
const signer_1 = require("@taquito/signer");
const taquito = require("@taquito/taquito");
const tzip16 = require("@taquito/tzip16");
const common_1 = require("../common");
const axios_1 = require("axios");
// Magic Number controlling how long to wait before confirming success.
// Seems to be an art more than a science, 3 was suggested by a help thread.
const CONFIRMATION_CHECKS = 3;
function defaultBCD() {
    return {
        base: "https://api.better-call.dev",
        network: 'mainnet',
        version: 1
    };
}
class ContractClient {
    constructor(opts) {
        this.bcd = opts.betterCallDevConfig || defaultBCD();
        this.contractType = opts.contractType;
        this.dereferenceContent = opts.dereferenceContent;
        this.hashContent = opts.hashContent;
        this.nodeURL = opts.nodeURL;
        this.signer = opts.signer;
        this.tezos = new taquito.TezosToolkit(this.nodeURL);
        this.validateType = opts.validateType;
        // Lack of async constructor causes some special handling of setting the signer.
        if (this.signer) {
            this.setSigner();
        }
    }
    // Lack of async constructor causes some special handling of setting the signer.
    setSigner() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error("Requires valid Signer options to be able to set signing method");
            }
            let t = this.signer.type;
            switch (this.signer.type) {
                case "key":
                    yield signer_1.importKey(this.tezos, this.signer.key.email, this.signer.key.password, this.signer.key.mnemonic.join(' '), this.signer.key.secret);
                    this.signerSet = true;
                    return;
                case "secret":
                    this.tezos.setProvider({
                        signer: new signer_1.InMemorySigner(this.signer.secret)
                    });
                    this.signerSet = true;
                    return;
                case "wallet":
                    this.tezos.setWalletProvider(this.signer.wallet);
                    this.signerSet = true;
                    return;
                default:
                    throw new Error(`Unknown signer type passed: ${t}`);
            }
        });
    }
    getPKH() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error("Requires valid Signer options to be able to create PKH");
            }
            // Under some circumstances, the signer may not be set due to quickly
            // calling this function following instanciating it, and given that the 
            // contstructor must by synchronous. If it is unset, it is not dangerous
            // to reset it.
            if (!this.signerSet) {
                yield this.setSigner();
            }
            let t = this.signer.type;
            switch (this.signer.type) {
                case "key":
                case "secret":
                    return yield this.tezos.signer.publicKeyHash();
                case "wallet":
                    return yield this.signer.wallet.getPKH();
                default:
                    throw new Error(`Unknown signer type passed: ${t}`);
            }
        });
    }
    // end the debate before it begins.
    trailingSlash(s) {
        return s[s.length - 1] === "/" ? "" : "/";
    }
    // Create a standard base URL for all future calls.
    bcdPrefix() {
        return `${this.bcd.base}${this.trailingSlash(this.bcd.base)}v${this.bcd.version}/`;
    }
    processTriple(claimChildren) {
        let [rc, hc, tc] = claimChildren;
        let r = rc.value;
        let h = hc.value;
        let t = tc.value;
        return [r, h, t];
    }
    processContentList(contentList) {
        return __awaiter(this, void 0, void 0, function* () {
            let invalid = [];
            let valid = [];
            for (let i = 0, n = contentList.length; i < n; i++) {
                let [reference, hash, contentType] = contentList[i];
                let content;
                try {
                    content = yield this.dereferenceContent(reference);
                }
                catch (err) {
                    invalid.push([reference, hash, contentType, null, err]);
                    continue;
                }
                try {
                    yield this.validateType(content, contentType);
                }
                catch (err) {
                    invalid.push([reference, hash, contentType, content, err]);
                    continue;
                }
                try {
                    let h = yield this.hashContent(content);
                    if (h !== hash)
                        throw new Error("Hashes do not match");
                }
                catch (err) {
                    invalid.push([reference, hash, contentType, content, err]);
                    continue;
                }
                valid.push([reference, content, contentType]);
            }
            return [invalid, valid];
        });
    }
    validateItem(item) {
        var _a;
        return ((item === null || item === void 0 ? void 0 : item.type) &&
            item.type === "contract" &&
            Array.isArray((_a = item === null || item === void 0 ? void 0 : item.body) === null || _a === void 0 ? void 0 : _a.annotations) &&
            item.body.annotations.includes("%addClaims") &&
            item.body.annotations.includes("%removeClaims") &&
            item.body.annotations.includes("%claims") &&
            item.body.annotations.includes("%metadata") &&
            item.body.annotations.includes("%owner"));
    }
    validateStorage(s) {
        var _a;
        let hasClaims = (s &&
            Array.isArray(s) &&
            s[0] &&
            s[0].children &&
            Array.isArray(s[0].children) &&
            ((_a = s[0].children[0]) === null || _a === void 0 ? void 0 : _a.name) === "claims");
        if (!hasClaims) {
            throw new Error("No claims found in contract storage");
        }
        if (!this.hasContractType(s))
            throw new Error("Contract type not found in metadata");
    }
    hasContractType(s) {
        var _a, _b;
        return ((_a = s[0].children[1]) === null || _a === void 0 ? void 0 : _a.name) === "contract_type" && ((_b = s[0].children[1]) === null || _b === void 0 ? void 0 : _b.value) === "tzprofiles";
    }
    // Retrieves the claimsList belonging to the given address, returns false if
    // if the contract storage does not have a claims list or expected metadata
    // throws an error in case of network issues.
    retrieveAndScreenContract(contractAddress) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let prefix = this.bcdPrefix();
            let storageRes = yield axios_1.default.get(`${prefix}contract/${this.bcd.network}/${contractAddress}/storage`);
            if (storageRes.status !== 200) {
                throw new Error(`Failed in explorer request: ${storageRes.statusText}`);
            }
            let { data } = storageRes;
            try {
                this.validateStorage(data);
            }
            catch (_e) {
                return false;
            }
            let contractStorageList = ((_a = data[0].children[0]) === null || _a === void 0 ? void 0 : _a.children) || [];
            return contractStorageList;
        });
    }
    // contentListFromStorage returns a set of claims for a given contract address
    // storage returns an list of ContentTriples if found, false if not, and
    // throws and error if the network fails
    contentListFromStorage(claimList) {
        return __awaiter(this, void 0, void 0, function* () {
            let tripleList = [];
            for (let i = 0, n = claimList.length; i < n; i++) {
                let claim = claimList[i];
                if (claim.children.length !== 3) {
                    throw new Error("Invalid claim, was not a triple");
                }
                tripleList.push(this.processTriple(claim.children));
            }
            return tripleList;
        });
    }
    referenceToTriple(t, r) {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield this.dereferenceContent(r);
            yield this.validateType(c, t);
            let h = yield this.hashContent(c);
            return [r, h, t];
        });
    }
    // retrieve finds a smart contract from it's owner's wallet address, returns a 
    // result including the contract address and valid / invalid claims if found, 
    // false if not, or throws an error if the network fails
    retrieve(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            let prefix = this.bcdPrefix();
            let searchRes = yield axios_1.default.get(`${prefix}search?q=${walletAddress}&n=${this.bcd.network}&i=contract&f=manager`);
            if (searchRes.status !== 200) {
                throw new Error(`Failed in explorer request: ${searchRes.statusText}`);
            }
            let { data } = searchRes;
            if (data.count == 0) {
                return false;
            }
            let items = data.items;
            let possibleAddresses = [];
            for (let i = 0, n = items.length; i < n; i++) {
                let item = items[i];
                if (this.validateItem(item)) {
                    possibleAddresses.push(item.value);
                }
            }
            for (let i = 0, n = possibleAddresses.length; i < n; i++) {
                let address = possibleAddresses[i];
                let storage = yield this.retrieveAndScreenContract(address);
                if (storage) {
                    let cl = yield this.contentListFromStorage(storage);
                    let [invalid, valid] = yield this.processContentList(cl);
                    return {
                        address,
                        invalid,
                        valid
                    };
                }
            }
            return false;
        });
    }
    // originate creates a new smart contract from an optional, original set of 
    // claims. returns the address of the created contract or throws an err
    originate(contentReferenceList) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error("Requires valid Signer options to be able to originate");
            }
            if (!this.signerSet) {
                yield this.setSigner();
            }
            let pkh = yield this.getPKH();
            let prexisting = yield this.retrieve(pkh);
            if (prexisting) {
                throw new Error(`Cannot originate new smart contract, found existing smart contract at address ${prexisting} for wallet ${pkh}`);
            }
            let contentList = [];
            for (let i = 0, x = contentReferenceList.length; i < x; i++) {
                let [t, r] = contentReferenceList[i];
                let triple = yield this.referenceToTriple(t, r);
                contentList.push(triple);
            }
            const metadataBigMap = new taquito.MichelsonMap();
            metadataBigMap.set("", tzip16.char2Bytes("https://gist.githubusercontent.com/sbihel/a9273df118862acba2b4d15a8778e3dd/raw/0debf54a941fdda9cfde4d34866535d302856885/tpp-metadata.json"));
            let originationOp, contractAddress;
            let args = {
                code: common_1.contract,
                storage: {
                    claims: contentList,
                    contract_type: this.contractType,
                    owner: pkh,
                    metadata: metadataBigMap,
                },
            };
            if (this.signer.type === "wallet") {
                let opSender = yield this.tezos.wallet.originate(args);
                originationOp = yield opSender.send();
                let c = yield originationOp.contract();
                contractAddress = c.address;
            }
            else {
                originationOp = yield this.tezos.contract.originate(args);
                yield originationOp.confirmation(CONFIRMATION_CHECKS);
                contractAddress = originationOp.contractAddress;
            }
            return contractAddress;
        });
    }
    // addClaims takes a contractAddress and a list of pairs of contentType and references, 
    // adds them to the contract with the addClaims entrypoint returns the hash of 
    // the transaction
    addClaims(contractAddress, contentReferenceList) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error("Requires valid Signer options to be able to addClaims");
            }
            if (!this.signerSet) {
                yield this.setSigner();
            }
            let contentList = [];
            for (let i = 0, x = contentReferenceList.length; i < x; i++) {
                let [t, r] = contentReferenceList[i];
                let triple = yield this.referenceToTriple(t, r);
                contentList.push(triple);
            }
            let contract = yield this.tezos.contract.at(contractAddress);
            let op = yield contract.methods.addClaims(contentList).send();
            yield op.confirmation(CONFIRMATION_CHECKS);
            return op.hash;
        });
    }
    // removeClaims takes a contractAddress and a list of pairs of contentType 
    // and references, removes the entries from the contract storage with the 
    // removeClaims entrypoint and returns the hash of the transaction
    removeClaims(contractAddress, contentReferenceList) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error("Requires valid Signer options to be able to removeClaims");
            }
            if (!this.signerSet) {
                yield this.setSigner();
            }
            let contentList = [];
            for (let i = 0, x = contentReferenceList.length; i < x; i++) {
                let [t, r] = contentReferenceList[i];
                let triple = yield this.referenceToTriple(t, r);
                contentList.push(triple);
            }
            let contract = yield this.tezos.contract.at(contractAddress);
            let op = yield contract.methods.removeClaims(contentList).send();
            yield op.confirmation(CONFIRMATION_CHECKS);
            return op.hash;
        });
    }
}
exports.ContractClient = ContractClient;
