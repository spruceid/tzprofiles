import { BetterCallDevOpts, ContractClient, ContentResult, Signer } from "./contractClient";
import { Kepler } from 'kepler-sdk';
export declare type ClaimReference = string;
export declare type ClaimHash = string;
export declare type ClaimType = "VerifiableCredential";
export declare type ClaimContent = string;
export interface TZProfilesClientOpts {
    betterCallDevConfig: BetterCallDevOpts;
    keplerClient: Kepler;
    hashContent: (input: ClaimContent) => Promise<ClaimHash>;
    nodeURL: string;
    signer: Signer | false;
    validateType: (c: ClaimContent, t: ClaimType) => Promise<void>;
}
export declare class TZProfilesClient {
    contractClient: ContractClient<ClaimContent, ClaimType, ClaimHash, ClaimReference>;
    keplerClient: Kepler;
    constructor(opts: TZProfilesClientOpts);
    retrieve(walletAddress: string): Promise<ContentResult<ClaimContent, ClaimType, ClaimHash, ClaimReference> | false>;
    retrieveClaims(contractAddress: string): Promise<ContentResult<ClaimContent, ClaimType, ClaimHash, ClaimReference> | false>;
    originate(contentReferenceList: Array<[ClaimType, ClaimReference]>): Promise<string>;
    addClaims(contractAddress: string, newClaims: Array<[ClaimType, ClaimReference]>): Promise<string>;
    removeClaims(contractAddress: string, targetClaims: Array<[ClaimType, ClaimReference]>): Promise<string>;
}
