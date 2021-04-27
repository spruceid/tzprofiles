// TODO: Restore once the wallet can be properly typed.
// import type { BeaconWallet } from "@taquito/beacon-wallet";
import { InMemorySigner, importKey } from "@taquito/signer";
import * as taquito from "@taquito/taquito";
import * as tzip16 from "@taquito/tzip16";
import { contract } from "../common";
import axios from "axios";

// Magic Number controlling how long to wait before confirming success.
// Seems to be an art more than a science, 3 was suggested by a help thread.
const CONFIRMATION_CHECKS = 3;

// Use a browser based wallet via extension toolkit to handle signing
export interface WalletSigner {
	type: "wallet",
	// TODO: Resolve this error
	// wallet: BeaconWallet
	// This causes the following err in dapp: 
	// Type 'import("/path/to/tzprofiles/dapp/node_modules/@taquito/beacon-wallet/dist/types/taquito-beacon-wallet").BeaconWallet' is not assignable to type 'import("/Volumes/workshop/labor/spruce/tzprofiles/contract/node_modules/@taquito/beacon-wallet/dist/types/taquito-beacon-wallet").BeaconWallet'.
	// The types of 'client.blockExplorer' are incompatible between these types.

    // A prepared, authenticated BeaconWallet from taquito.
	wallet: any
}

// Use a plain-text secret key to build the signer
export interface SecretSigner {
	type: "secret",
    // 
	secret: string
}

// Use a JSON Object representing a key file to build the signer
export interface KeySigner {
	type: "key",
	key: {
		email: string,
		password: string,
		mnemonic: Array<string>,
		secret: string
	}
}

// A signer is a configuration which can be used to sign transactions 
// on behalf of a wallet
export type Signer = WalletSigner | SecretSigner | KeySigner;

export type BetterCallDevVersions = 1;
export type BetterCallDevNetworks = 'mainnet' | 'delphinet' | 'edonet' | 'florencenet' | 'custom';

// Configurable Better Call Dev to allow local development.
// Defaults to:
// {
//     base: "https://api.better-call.dev",
//     network: "mainnet",
//     version: 1
// }
export interface BetterCallDevOpts {
	base: string,
	network: BetterCallDevNetworks,
	version: BetterCallDevVersions,
}

export type ContentTriple<
    ContentType,
    Hash, 
    Reference, 
    > = [Reference, Hash, ContentType];

export type ContentList<
    ContentType,
    Hash, 
    Reference, 
    > = Array<ContentTriple<ContentType, Hash, Reference>>;

export type InvalidContent<
    ContentType,
    Hash, 
    Reference, 
    > = [Reference, Hash, ContentType, any, Error];

export type ValidContent<
    Content,
    ContentType, 
    Reference
    > = [Reference, Content, ContentType];

export type ContentResult<
    Content,
    ContentType, 
    Hash, 
    Reference, 
    > = { 
        address: string,
        invalid: Array<InvalidContent<ContentType, Hash, Reference>>,
        valid: Array<ValidContent<Content, ContentType, Reference>>, 
    };

interface ContentStorage {
    children: [ContentChild, ContentChild, ContentChild]
}

interface ContentChild {
    value: any
}

interface ContractStorageItem {
    type: string,
    value: string,
    body: {
        annotations: Array<string>
    }
}

function defaultBCD(): BetterCallDevOpts {
    return {
        base: "https://api.better-call.dev",
        network: 'mainnet',
        version: 1
    }
}

export interface ContractClientOpts<Content, ContentType, Hash, Reference> {
    // Defaults to:
    // {
    //     base: "https://api.better-call.dev",
    //     network: "mainnet",
    //     version: 1
    // }
    betterCallDevConfig?: BetterCallDevOpts,

    // An entry in the contract's metadata that allows it to be identified, used to 
    // prevent duplicate contracts of the same type from being originated under the
    // same owner.
    contractType: string,

    // dereferenceContent takes a reference from a content store triple and exchanges 
    // it for the content, such as making an HTTP request or using a kepler client.
    dereferenceContent: (r: Reference) => Promise<Content>,

    // hashContent takes content and processes it into a hash that matches the
    // second entry from the content triple, used to validate the claims match the content
    hashContent: (c: Content) => Promise<Hash>,

    // If read only, a Signer is un-needed, such as in the use-case of a search engine.
    // Will cause some methods to fail.
	signer: Signer | false,

    // Tezos Node URL to use, such as https://mainnet-tezos.giganode.io
	nodeURL: string,

    // validateType takes a content, it's listed type, and throws an error
    // if it is not validated. The invalid claims are seperated and err messages stored.
    validateType: (c: Content, t: ContentType) => Promise<void>,
}

export class ContractClient<Content, ContentType, Hash, Reference> {
    bcd: BetterCallDevOpts;
    contractType: string;
    dereferenceContent: (r: Reference) => Promise<Content>;
    hashContent: (c: Content) => Promise<Hash>;
	nodeURL: string;
	signer: Signer | false;
	signerSet: boolean;
	tezos: taquito.TezosToolkit;
    validateType: (c: Content, t: ContentType) => Promise<void>;

    constructor(opts: ContractClientOpts<Content, ContentType, Hash, Reference>) {
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
    private async setSigner(): Promise<void> {
		if (!this.signer) {
			throw new Error("Requires valid Signer options to be able to set signing method");
		}

		let t = this.signer.type;
		switch (this.signer.type) {
			case "key":
				await importKey(
					this.tezos,
					this.signer.key.email,
					this.signer.key.password,
					this.signer.key.mnemonic.join(' '),
					this.signer.key.secret,
				);
				this.signerSet = true;
				return
			case "secret":
				this.tezos.setProvider({
					signer: new InMemorySigner(this.signer.secret)
				});
				this.signerSet = true;
				return
			case "wallet":
				this.tezos.setWalletProvider(this.signer.wallet);
				this.signerSet = true;
				return
			default:
				throw new Error(`Unknown signer type passed: ${t}`)
		}
	}

    private async getPKH(): Promise<string> {
		if (!this.signer) {
			throw new Error("Requires valid Signer options to be able to create PKH")
		}

		// Under some circumstances, the signer may not be set due to quickly
		// calling this function following instanciating it, and given that the 
		// contstructor must by synchronous. If it is unset, it is not dangerous
		// to reset it.
		if (!this.signerSet) {
			await this.setSigner();
		}

		let t = this.signer.type;
		switch (this.signer.type) {
			case "key":
			case "secret":
				return await this.tezos.signer.publicKeyHash();
			case "wallet":
				return await this.signer.wallet.getPKH();
			default: 
				throw new Error(`Unknown signer type passed: ${t}`)
		}
	}

    // end the debate before it begins.
	private trailingSlash(s: String): string {
		return s[s.length - 1] === "/" ? "" : "/"
	}

	// Create a standard base URL for all future calls.
	private bcdPrefix(): string {
		return `${this.bcd.base}${this.trailingSlash(this.bcd.base)}v${this.bcd.version}/`
	}

    private processTriple(claimChildren: [ContentChild, ContentChild, ContentChild]): ContentTriple<ContentType, Hash, Reference> {
        let [rc, hc, tc] = claimChildren;
        let r = rc.value as Reference;
        let h = hc.value as Hash;
        let t = tc.value as ContentType;

        return [r, h, t];
    }

    private async processContentList(contentList: ContentList<ContentType, Hash, Reference>): 
        Promise<
            [
                Array<InvalidContent<ContentType, Hash, Reference>>, 
                Array<ValidContent<Content, ContentType, Reference>>
            ]> 
    {
        let invalid: Array<InvalidContent<ContentType, Hash, Reference>> = [];
        let valid: Array<ValidContent<Content, ContentType, Reference>> = [];
        for (let i = 0, n = contentList.length; i < n; i++) {
            let [reference, hash, contentType] = contentList[i];
            let content: Content;

            try {
                content = await this.dereferenceContent(reference);
            } catch (err) {
                invalid.push([reference, hash, contentType, null, err]);
                continue;
            }

            try {
                await this.validateType(content, contentType);
            } catch (err) {
                invalid.push([reference, hash, contentType, content, err]);
                continue;
            }

            try {
                let h = await this.hashContent(content);
                if (h !== hash) throw new Error("Hashes do not match");
            } catch (err) {
                invalid.push([reference, hash, contentType, content, err]);
                continue;
            }

            valid.push([reference, content, contentType]);
        }

        return [invalid, valid];
    }

    private validateItem(item: ContractStorageItem): boolean {
        return (
            item?.type &&
            item.type === "contract" &&
            Array.isArray(item?.body?.annotations) &&
            item.body.annotations.includes("%addClaims") &&
            item.body.annotations.includes("%removeClaims") &&
            item.body.annotations.includes("%claims") &&
            item.body.annotations.includes("%metadata") &&
            item.body.annotations.includes("%owner")
        );
    }

    private validateStorage(s: any): void {
        let hasClaims = (
            s && 
            Array.isArray(s) &&
            s[0] &&
            s[0].children &&
            Array.isArray(s[0].children) &&
            s[0].children[0]?.name === "claims"
        );

        if (!hasClaims) {
            throw new Error("No claims found in contract storage");
        }
        

        if (!this.hasContractType(s)) throw new Error("Contract type not found in metadata")
    }

    private hasContractType(s: any): boolean {
        return s[0].children[1]?.name === "contract_type" && s[0].children[1]?.value === "tzprofiles";
    }

    // Retrieves the claimsList belonging to the given address, returns false if
    // if the contract storage does not have a claims list or expected metadata
    // throws an error in case of network issues.
	private async retrieveAndScreenContract(contractAddress: string): Promise<Array<ContentStorage> | false> {
        let prefix = this.bcdPrefix();

		let storageRes = await axios.get(`${prefix}contract/${this.bcd.network}/${contractAddress}/storage`);
		if (storageRes.status !== 200) {
			throw new Error(`Failed in explorer request: ${storageRes.statusText}`);
		}

		let { data } = storageRes;

        try {
            this.validateStorage(data)
        } catch(_e) {
            return false;
        }

		let contractStorageList: Array<ContentStorage> = data[0].children[0]?.children || [];

        return contractStorageList;
    }

    // contentListFromStorage returns a set of claims for a given contract address
    // storage returns an list of ContentTriples if found, false if not, and
	// throws and error if the network fails
	private async contentListFromStorage(claimList: Array<ContentStorage>): Promise<ContentList<ContentType, Hash, Reference>> {
		let tripleList: ContentList<ContentType, Hash, Reference> = [];
		for (let i = 0, n = claimList.length; i < n; i++) {
			let claim = claimList[i];
			if (claim.children.length !== 3) {
				throw new Error("Invalid claim, was not a triple");
			}

			tripleList.push(this.processTriple(claim.children));
		}

		return tripleList;
	}

    private async referenceToTriple(t: ContentType, r: Reference): Promise<ContentTriple<ContentType, Hash, Reference>> {
        let c = await this.dereferenceContent(r);
        await this.validateType(c, t);
        let h = await this.hashContent(c);

        return [r, h, t];
    }

    // retrieve finds a smart contract from it's owner's wallet address, returns a 
    // result including the contract address and valid / invalid claims if found, 
    // false if not, or throws an error if the network fails
	async retrieve(walletAddress: string): Promise<
        ContentResult<Content, ContentType, Hash, Reference>
        | false
    > {
		let prefix = this.bcdPrefix();
		let searchRes = await axios.get(`${prefix}search?q=${walletAddress}&n=${this.bcd.network}&i=contract&f=manager`);
		if (searchRes.status !== 200) {
			throw new Error(`Failed in explorer request: ${searchRes.statusText}`);
		}

		let { data } = searchRes;
		if (data.count == 0) {
			return false;
		}

        let items: Array<ContractStorageItem> = data.items;
        let possibleAddresses: Array<string> = [];

		for (let i = 0, n = items.length; i < n; i++) {
			let item = items[i];
            if (this.validateItem(item)) {
                possibleAddresses.push(item.value);
            }
		}

        for (let i = 0, n = possibleAddresses.length; i < n; i++) {
            let address = possibleAddresses[i];
            let storage = await this.retrieveAndScreenContract(address);
            if (storage) {
                let cl = await this.contentListFromStorage(storage);
                let [invalid, valid] = await this.processContentList(cl);
                return {
                    address,
                    invalid,
                    valid
                };
            }
        }

		return false;
	}

    // originate creates a new smart contract from an optional, original set of 
    // claims. returns the address of the created contract or throws an err
	async originate(contentReferenceList: Array<[ContentType, Reference]>): Promise<string> {
		if (!this.signer) {
			throw new Error("Requires valid Signer options to be able to originate");
		}

		if (!this.signerSet) {
			await this.setSigner();
		}

		let pkh = await this.getPKH();
		let prexisting = await this.retrieve(pkh);
		if (prexisting) {
			throw new Error(`Cannot originate new smart contract, found existing smart contract at address ${prexisting} for wallet ${pkh}`);
		}

		let contentList: ContentList<ContentType, Hash, Reference> = [];
		for (let i = 0, x = contentReferenceList.length; i < x; i++) {
			let [t, r] = contentReferenceList[i];
			let triple = await this.referenceToTriple(t, r);
			contentList.push(triple);
		}

		const metadataBigMap = new taquito.MichelsonMap();
		metadataBigMap.set("", tzip16.char2Bytes("https://gist.githubusercontent.com/sbihel/a9273df118862acba2b4d15a8778e3dd/raw/0debf54a941fdda9cfde4d34866535d302856885/tpp-metadata.json"));

		let originationOp, contractAddress;
        let args = {
            code: contract,
            storage: {
                claims: contentList,
                contract_type: this.contractType,
                owner: pkh,
                metadata: metadataBigMap,
            },
        };

		if (this.signer.type === "wallet") {
			let opSender = await this.tezos.wallet.originate(args);
			originationOp = await opSender.send();

			let c = await originationOp.contract();
			contractAddress = c.address;
		} else {
			originationOp = await this.tezos.contract.originate(args);

			await originationOp.confirmation(CONFIRMATION_CHECKS);
			contractAddress = originationOp.contractAddress;
		}

		return contractAddress;
	}

    // addClaims takes a contractAddress and a list of pairs of contentType and references, 
    // adds them to the contract with the addClaims entrypoint returns the hash of 
    // the transaction
	async addClaims(contractAddress: string, contentReferenceList: Array<[ContentType, Reference]>): Promise<string> {
		if (!this.signer) {
			throw new Error("Requires valid Signer options to be able to addClaims");
		}

		if (!this.signerSet) {
			await this.setSigner();
		}

		let contentList: ContentList<ContentType, Hash, Reference> = [];
		for (let i = 0, x = contentReferenceList.length; i < x; i++) {
			let [t, r] = contentReferenceList[i];
			let triple = await this.referenceToTriple(t, r);
			contentList.push(triple);
		}

		let contract = await this.tezos.contract.at(contractAddress);

		let op = await contract.methods.addClaims(contentList).send();

		await op.confirmation(CONFIRMATION_CHECKS);

		return op.hash;
	}

    // removeClaims takes a contractAddress and a list of pairs of contentType 
    // and references, removes the entries from the contract storage with the 
    // removeClaims entrypoint and returns the hash of the transaction
	async removeClaims(contractAddress: string, contentReferenceList: Array<[ContentType, Reference]>): Promise<string> {
		if (!this.signer) {
			throw new Error("Requires valid Signer options to be able to removeClaims");
		}

		if (!this.signerSet) {
			await this.setSigner();
		}

		let contentList: ContentList<ContentType, Hash, Reference> = [];
		for (let i = 0, x = contentReferenceList.length; i < x; i++) {
			let [t, r] = contentReferenceList[i];
			let triple = await this.referenceToTriple(t, r);
			contentList.push(triple);
		}

		let contract = await this.tezos.contract.at(contractAddress);
		let op = await contract.methods.removeClaims(contentList).send();
		await op.confirmation(CONFIRMATION_CHECKS);

		return op.hash;
	}
}
