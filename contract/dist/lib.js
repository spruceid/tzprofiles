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
exports.retrieve_tpp = exports.remove_claim = exports.add_claim = exports.originate = void 0;
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
            let claims = [];
            for (let i = 0, x = claim_urls.length; i < x; i++) {
                let claim_url = claim_urls[i];
                let nextClaim = yield url_to_entry(claim_url, verifyCredential, hashFunc, fetchFunc);
                claims.push(nextClaim);
            }
            const metadataBigMap = new taquito.MichelsonMap();
            metadataBigMap.set("", tzip16.char2Bytes("https://gist.githubusercontent.com/sbihel/a9273df118862acba2b4d15a8778e3dd/raw/0debf54a941fdda9cfde4d34866535d302856885/tpp-metadata.json"));
            console.log("About to try origination");
            let originationOp, contractAddress;
            if (opts.useWallet) {
                console.log("In use wallet");
                let opSender = yield Tezos.wallet.originate({
                    code: common_1.contract,
                    storage: {
                        claims: claims,
                        owner: pkHash,
                        metadata: metadataBigMap,
                    },
                });
                console.log("About to send");
                originationOp = yield opSender.send();
                console.log("awaiting confimation");
                contractAddress = yield originationOp.contract().address;
            }
            else {
                console.log("in use secret");
                originationOp = yield Tezos.contract.originate({
                    code: common_1.contract,
                    storage: {
                        claims: claims,
                        owner: pkHash,
                        metadata: metadataBigMap,
                    },
                });
                console.log("awaiting confimation");
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
        let claimJSON = JSON.parse(claimBody);
        console.log(claimJSON);
        let t = "VerifiableCredential";
        if (claimJSON.type && claimJSON.type.length && claimJSON.type.length > 0) {
            t = claimJSON.type[claimJSON.type.length - 1];
        }
        console.log("Survived URLToEntry");
        return [claim_url, vcHashHex, t];
    });
}
// retrieve_tpp finds a smart contract from it's owner's 
// returns an address if found, false if not, or throws and error if the network fails
function retrieve_tpp(bcd_url, address, network, fetchFunc) {
    return __awaiter(this, void 0, void 0, function* () {
        let searchRes = yield fetchFunc(`${bcd_url}/v1/search?q=${address}&n=${network}&i=contract`);
        let searchJSON = yield searchRes.json();
        if (searchJSON.count == 0) {
            return false;
        }
        for (var item of searchJSON.items) {
            if (item.type != "contract") {
                continue;
            }
            if (item.body.entrypoints.includes("addClaim") && item.body.entrypoints.includes("removeClaim")) {
                return item.value;
            }
        }
        return false;
    });
}
exports.retrieve_tpp = retrieve_tpp;
// read_all lists all entries in the contract metadata
// export async function read_all(contract_address: string) {
// }
