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
exports.retrieve_tpp_claims = exports.retrieve_tpp = exports.remove_claim = exports.add_claim = exports.originate = void 0;
// TODO: Resotre when this no longer errs out as an unused var
// import type { BeaconWallet } from "@taquito/beacon-wallet";
const signer_1 = require("@taquito/signer");
const taquito = require("@taquito/taquito");
const tzip16 = require("@taquito/tzip16");
const common_1 = require("../common");
const CONFIRMATION_CHECKS = 3;
// NOTE: hashFunc for the browser is currently unimplemented but would look like:
// async (claimBody) => {
// let encodedBody = new TextEncoder().encode(claimBody);
// await crypto.subtle.digest('SHA-256', encodedBody)
// }
// originate creates a new smart contract from a given wallet
// Returns nothing or throws an err
function originate(opts, node_url, claim_urls, verifyCredential, hashFunc, fetchFunc) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const Tezos = new taquito.TezosToolkit(node_url);
            Tezos.addExtension(new tzip16.Tzip16Module());
            let pkHash;
            if (opts.useWallet) {
                Tezos.setWalletProvider(opts.wallet);
                pkHash = yield opts.wallet.getPKH();
            }
            else if (opts.useSecret) {
                Tezos.setProvider({
                    signer: new signer_1.InMemorySigner(opts.secret)
                });
                pkHash = yield Tezos.signer.publicKeyHash();
            }
            else if (opts.useKeyFile) {
                yield signer_1.importKey(Tezos, opts.key.email, opts.key.password, opts.key.mnemonic.join(' '), opts.key.secret);
                pkHash = yield Tezos.signer.publicKeyHash();
            }
            else {
                throw new Error("No signing method found in opts");
            }
            let claims = yield Promise.all(claim_urls.map(claim_url => url_to_entry(claim_url, verifyCredential, hashFunc, fetchFunc)));
            const metadataBigMap = new taquito.MichelsonMap();
            metadataBigMap.set("", tzip16.char2Bytes("https://gist.githubusercontent.com/sbihel/a9273df118862acba2b4d15a8778e3dd/raw/0debf54a941fdda9cfde4d34866535d302856885/tpp-metadata.json"));
            let originationOp, contractAddress;
            if (opts.useWallet) {
                let opSender = yield Tezos.wallet.originate({
                    code: common_1.contract,
                    storage: {
                        claims: claims,
                        owner: pkHash,
                        metadata: metadataBigMap,
                    },
                });
                originationOp = yield opSender.send();
                let c = yield originationOp.contract();
                contractAddress = yield c.address;
            }
            else {
                originationOp = yield Tezos.contract.originate({
                    code: common_1.contract,
                    storage: {
                        claims: claims,
                        owner: pkHash,
                        metadata: metadataBigMap,
                    },
                });
                yield originationOp.confirmation(CONFIRMATION_CHECKS);
                contractAddress = originationOp.contractAddress;
            }
            console.log(`Origination of ${contractAddress} Complete`);
            return contractAddress;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    });
}
exports.originate = originate;
// add_entry takes a wallet, contract_address, and entry to store and called the add_entry
// command in the smart contract
function add_claim(opts, contract_address, claim_url, node_url, verifyCredential, hashFunc, fetchFunc) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const Tezos = new taquito.TezosToolkit(node_url);
            Tezos.addExtension(new tzip16.Tzip16Module());
            if (opts.useWallet) {
                Tezos.setWalletProvider(opts.wallet);
            }
            else if (opts.useSecret) {
                Tezos.setProvider({
                    signer: new signer_1.InMemorySigner(opts.secret)
                });
            }
            else if (opts.useKeyFile) {
                yield signer_1.importKey(Tezos, opts.key.email, opts.key.password, opts.key.mnemonic.join(' '), opts.key.secret);
            }
            else {
                throw new Error("No signing method found in opts");
            }
            let entry = yield url_to_entry(claim_url, verifyCredential, hashFunc, fetchFunc);
            let contract = yield Tezos.contract
                .at(contract_address);
            let op = yield contract.methods.addClaim(entry).send();
            yield op.confirmation(CONFIRMATION_CHECKS);
            let hash = op.hash;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    });
}
exports.add_claim = add_claim;
function remove_claim(opts, contract_address, claim_url, node_url, verifyCredential, hashFunc, fetchFunc) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const Tezos = new taquito.TezosToolkit(node_url);
            Tezos.addExtension(new tzip16.Tzip16Module());
            if (opts.useWallet) {
                Tezos.setWalletProvider(opts.wallet);
            }
            else if (opts.useSecret) {
                Tezos.setProvider({
                    signer: new signer_1.InMemorySigner(opts.secret)
                });
            }
            else if (opts.useKeyFile) {
                yield signer_1.importKey(Tezos, opts.key.email, opts.key.password, opts.key.mnemonic.join(' '), opts.key.secret);
            }
            else {
                throw new Error("No signing method found in opts");
            }
            let entry = yield url_to_entry(claim_url, verifyCredential, hashFunc, fetchFunc);
            let contract = yield Tezos.contract
                .at(contract_address);
            let op = yield contract.methods.removeClaim(entry).send();
            yield op.confirmation(CONFIRMATION_CHECKS);
            let hash = op.hash;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    });
}
exports.remove_claim = remove_claim;
function url_to_entry(claim_url, verifyCredential, hashFunc, fetchFunc) {
    return __awaiter(this, void 0, void 0, function* () {
        let claimRes = yield fetchFunc(claim_url);
        let claimBody = yield claimRes.text();
        // TODO: Restore once this actually works.
        // Validate VC
        // let verifyResult = await verifyCredential(claimBody, '{}');
        // let verifyJSON = JSON.parse(verifyResult);
        // if (verifyJSON.errors.length > 0) throw verifyJSON.errors;
        // Hash VC
        let vcHash = yield hashFunc(claimBody);
        // let vcHash = await crypto.subtle.digest('SHA-256', encodedBody);
        let vcHashHex = Array
            .from(new Uint8Array(vcHash))
            .map(b => ('00' + b.toString(16)).slice(-2))
            .join('');
        let claimJSON = JSON.parse(JSON.parse(claimBody));
        let t = "VerifiableCredential";
        if (claimJSON.type && claimJSON.type.length && claimJSON.type.length > 0) {
            t = claimJSON.type[claimJSON.type.length - 1];
        }
        return [claim_url, vcHashHex, t];
    });
}
// retrieve_tpp finds a smart contract from it's owner's
// returns an address if found, false if not, or throws and error if the network fails
function retrieve_tpp(bcd_url, address, network, fetchFunc) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO: Make version passable?
        let searchRes = yield fetchFunc(`${bcd_url}/v1/search?q=${address}&n=${network}&i=contract`);
        if (!searchRes.ok || searchRes.status !== 200) {
            throw new Error(`Failed in explorer request: ${searchRes.statusText}`);
        }
        let searchJSON = yield searchRes.json();
        if (searchJSON.count == 0) {
            return false;
        }
        for (var item of searchJSON.items) {
            if (item.type != "contract") {
                continue;
            }
            // TODO: Make this contract ID much more fool proof.
            if (item.body.entrypoints.includes("addClaim") && item.body.entrypoints.includes("removeClaim")) {
                return item.value;
            }
        }
        return false;
    });
}
exports.retrieve_tpp = retrieve_tpp;
// retrieve_tpp's set of claims for a given wallet address
// returns an address if found, false if not, or throws and error if the network fails
function retrieve_tpp_claims(bcd_url, address, network, fetchFunc) {
    return __awaiter(this, void 0, void 0, function* () {
        let contractAddress = yield retrieve_tpp(bcd_url, address, network, fetchFunc);
        if (!contractAddress) {
            return false;
        }
        // TODO: Make version passable?
        let storageRes = yield fetchFunc(`${bcd_url}/v1/contract/${network}/${contractAddress}/storage`);
        let storageJSON = yield storageRes.json();
        if (!validateStorage(storageJSON)) {
            throw new Error("Invalid storage, could not find list of triples");
        }
        let claimList = storageJSON.children[0].children;
        let tripleList = [];
        for (let i = 0, n = claimList.length; i < n; i++) {
            let claim = claimList[i];
            if (claim.children.length !== 3) {
                throw new Error("Invalid claim, was not a triple");
            }
            let [urlWrapper, hashWrapper, typeWrapper] = claim.children;
            let nextTriple = [urlWrapper.value, hashWrapper.value, typeWrapper.value];
            tripleList = nextTriple;
        }
        return tripleList;
    });
}
exports.retrieve_tpp_claims = retrieve_tpp_claims;
function validateStorage(s) {
    var _a;
    return (s &&
        s.children &&
        s.children.length &&
        s.children.length > 0 &&
        s.children[0].name === "claims" && ((_a = 
    // TODO: Check if this will report an empty TPP contract as not existing?
    s.children[0]) === null || _a === void 0 ? void 0 : _a.children));
}
// read_all lists all entries in the contract metadata
// export async function read_all(contract_address: string) {
// }
