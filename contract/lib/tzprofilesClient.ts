import { BetterCallDevOpts, ContractClient, ContractClientOpts, ContentResult, Signer} from "./contractClient";
import { Kepler } from 'kepler-sdk';

// NOTE: Could add pattern here.
export type ClaimReference = string;
export type ClaimHash = string;
// TODO: Make a sum type?
export type ClaimType = "VerifiableCredential"; 
export type ClaimContent = string;

// Opts are used to create new ContractClients
export interface TZProfilesClientOpts {
	betterCallDevConfig: BetterCallDevOpts,
	keplerClient: Kepler,
	// hashContent should take stringified JSON and return a hash for content validation.
	hashContent: (input: ClaimContent) => Promise<ClaimHash>,

	nodeURL: string,
	signer: Signer | false,

	// Validate content based on claim type. Throw an error when invalid.
	validateType: (c: ClaimContent, t: ClaimType) => Promise<void>
}

// Client exposes operations on a TZP contract and queries to better-call.dev
export class TZProfilesClient {
	contractClient: ContractClient<ClaimContent, ClaimType, ClaimHash, ClaimReference>;
	keplerClient: Kepler;

	constructor(opts: TZProfilesClientOpts) {
		this.keplerClient = opts.keplerClient;

		let clientOpts: ContractClientOpts<
			ClaimContent, 
			ClaimType, 
			ClaimHash, 
			ClaimReference
			> = {
				betterCallDevConfig: opts.betterCallDevConfig,
				contractType: "tzprofiles",
				dereferenceContent: async (r: ClaimReference): Promise<ClaimContent> => {
					let res = await this.keplerClient.resolve(r, false);
					if (!res.ok || res.status !== 200) {
						throw new Error(`Failed in kepler resolve: ${res.statusText}`);
					}

					return await res.text();
				},
				hashContent: opts.hashContent,
				signer: opts.signer,
				nodeURL: opts.nodeURL,
				validateType: opts.validateType
			};

		this.contractClient = new ContractClient(clientOpts);
	}

    // retrieve finds a tzprofiles contract from it's owner's wallet address, returns a 
    // result including the contract address and valid / invalid claims if found, 
	// false if not, or throws an error if the network fails
	async retrieve(walletAddress: string): Promise<
        ContentResult<ClaimContent, ClaimType, ClaimHash, ClaimReference>
        | false
	> {
		return await this.contractClient.retrieve(walletAddress);
	}

    // originate creates a new tzprofiles contract from an optional, original set of 
    // claims. returns the address of the created contract or throws an err
	async originate(contentReferenceList: Array<[ClaimType, ClaimReference]>): Promise<string> {
		return await this.contractClient.originate(contentReferenceList);
	}

    // addClaims takes a contractAddress and a list of pairs of claimType and kepler url, 
    // adds them to the contract with the addClaims entrypoint returns the hash of 
    // the transaction
	async addClaims(contractAddress: string, newClaims: Array<[ClaimType, ClaimReference]>): Promise<string> {
		return await this.contractClient.addClaims(contractAddress, newClaims);
	}

    // removeClaims takes a contractAddress and a list of pairs of contentType 
    // and references, removes the entries from the contract storage with the 
    // removeClaims entrypoint and returns the hash of the transaction
	async removeClaims(contractAddress: string, targetClaims: Array<[ClaimType, ClaimReference]>): Promise<string> {
		return await this.contractClient.removeClaims(contractAddress, targetClaims);
	}
}