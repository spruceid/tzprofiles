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
exports.TZProfilesClient = void 0;
const contractClient_1 = require("./contractClient");
// Client exposes operations on a TZP contract and queries to TzKT
class TZProfilesClient {
    constructor(opts) {
        this.keplerClient = opts.keplerClient;
        let clientOpts = {
            tzktBase: opts.tzktBase,
            contractType: "tzprofiles",
            dereferenceContent: (r) => __awaiter(this, void 0, void 0, function* () {
                let res = yield this.keplerClient.resolve(r, false);
                if (!res.ok || res.status !== 200) {
                    throw new Error(`Failed in kepler resolve: ${res.statusText}`);
                }
                return yield res.text();
            }),
            hashContent: opts.hashContent,
            signer: opts.signer,
            nodeURL: opts.nodeURL,
            validateType: opts.validateType
        };
        this.contractClient = new contractClient_1.ContractClient(clientOpts);
    }
    // retrieve finds a tzprofiles contract from it's owner's wallet address, returns a 
    // result including the contract address and valid / invalid claims if found, 
    // false if not, or throws an error if the network fails
    retrieve(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.contractClient.retrieve(walletAddress);
        });
    }
    retrieveClaims(contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.contractClient.retrieveClaims(contractAddress);
        });
    }
    // originate creates a new tzprofiles contract from an optional, original set of 
    // claims. returns the address of the created contract or throws an err
    originate(contentReferenceList) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.contractClient.originate(contentReferenceList);
        });
    }
    // addClaims takes a contractAddress and a list of pairs of claimType and kepler url, 
    // adds them to the contract with the addClaims entrypoint returns the hash of 
    // the transaction
    addClaims(contractAddress, newClaims) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.contractClient.addClaims(contractAddress, newClaims);
        });
    }
    // removeClaims takes a contractAddress and a list of pairs of contentType 
    // and references, removes the entries from the contract storage with the 
    // removeClaims entrypoint and returns the hash of the transaction
    removeClaims(contractAddress, targetClaims) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.contractClient.removeClaims(contractAddress, targetClaims);
        });
    }
}
exports.TZProfilesClient = TZProfilesClient;
