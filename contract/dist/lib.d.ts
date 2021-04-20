interface SignerOpts {
    useWallet?: boolean;
    wallet?: any;
    useSecret?: boolean;
    secret?: string;
    useKeyFile?: boolean;
    key?: any;
}
export declare function originate(opts: SignerOpts, node_url: string, claim_urls: string[], verifyCredential: any, hashFunc: any, fetchFunc: any): Promise<string>;
export declare function add_claim(opts: SignerOpts, contract_address: string, claim_url: string, node_url: string, verifyCredential: any, hashFunc: any, fetchFunc: any): Promise<void>;
export declare function remove_claim(opts: SignerOpts, contract_address: string, claim_url: string, node_url: string, verifyCredential: any, hashFunc: any, fetchFunc: any): Promise<void>;
export declare function retrieve_tpp(bcd_url: string, address: string, network: string, fetchFunc: any): Promise<any>;
export declare function retrieve_tpp_claims(bcd_url: string, address: string, network: string, fetchFunc: any): Promise<false | any[]>;
export {};
