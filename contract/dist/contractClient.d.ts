import * as taquito from "@taquito/taquito";
import { ContractAbstraction, ContractProvider } from "@taquito/taquito";
export interface WalletSigner {
    type: "wallet";
    wallet: any;
}
export interface SecretSigner {
    type: "secret";
    secret: string;
}
export interface KeySigner {
    type: "key";
    key: {
        email: string;
        password: string;
        mnemonic: Array<string>;
        secret: string;
    };
}
export declare type Signer = WalletSigner | SecretSigner | KeySigner;
export declare type BetterCallDevVersions = 1;
export declare type BetterCallDevNetworks = 'mainnet' | 'delphinet' | 'edonet' | 'florencenet' | 'sandboxnet';
export interface BetterCallDevOpts {
    base: string;
    network: BetterCallDevNetworks;
    version: BetterCallDevVersions;
}
export declare type ContentTriple<ContentType, Hash, Reference> = [Reference, Hash, ContentType];
export declare type ContentList<ContentType, Hash, Reference> = Array<ContentTriple<ContentType, Hash, Reference>>;
export declare type InvalidContent<ContentType, Hash, Reference> = [Reference, Hash, ContentType, any, Error];
export declare type ValidContent<Content, ContentType, Reference> = [Reference, Content, ContentType];
export declare type ContentResult<Content, ContentType, Hash, Reference> = {
    address: string;
    invalid: Array<InvalidContent<ContentType, Hash, Reference>>;
    valid: Array<ValidContent<Content, ContentType, Reference>>;
};
export interface ContractClientOpts<Content, ContentType, Hash, Reference> {
    betterCallDevConfig?: BetterCallDevOpts;
    contractType: string;
    dereferenceContent: (r: Reference) => Promise<Content>;
    hashContent: (c: Content) => Promise<Hash>;
    signer: Signer | false;
    nodeURL: string;
    validateType: (c: Content, t: ContentType) => Promise<void>;
}
export declare class ContractClient<Content, ContentType, Hash, Reference> {
    bcd: BetterCallDevOpts;
    contractType: string;
    dereferenceContent: (r: Reference) => Promise<Content>;
    hashContent: (c: Content) => Promise<Hash>;
    nodeURL: string;
    signer: Signer | false;
    signerSet: boolean;
    tezos: taquito.TezosToolkit;
    validateType: (c: Content, t: ContentType) => Promise<void>;
    constructor(opts: ContractClientOpts<Content, ContentType, Hash, Reference>);
    private setSigner;
    private getPKH;
    private trailingSlash;
    private bcdPrefix;
    private processTriple;
    private processContentList;
    private validateItem;
    private retrieveAndScreenContract;
    private contentListFromStorage;
    private referenceToTriple;
    private retrieveAllContracts;
    retrieve(walletAddress: string): Promise<ContentResult<Content, ContentType, Hash, Reference> | false>;
    originate(contentReferenceList: Array<[ContentType, Reference]>): Promise<string>;
    getContract(address: string): Promise<ContractAbstraction<ContractProvider | taquito.Wallet>>;
    addClaims(contractAddress: string, contentReferenceList: Array<[ContentType, Reference]>): Promise<string>;
    removeClaims(contractAddress: string, contentReferenceList: Array<[ContentType, Reference]>): Promise<string>;
}
