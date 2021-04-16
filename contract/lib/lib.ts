// TODO: Resotre when this no longer errs out as an unused var
// import type { BeaconWallet } from "@taquito/beacon-wallet";
import { InMemorySigner, importKey } from "@taquito/signer";
import * as taquito from "@taquito/taquito";
import { Wallet } from "@taquito/taquito";
import * as tzip16 from "@taquito/tzip16";
import { contract } from "../common";

const CONFIRMATION_CHECKS = 3;

interface SignerOpts {
	useWallet?: boolean,
	wallet?: any,
	useSecret?: boolean,
	secret?: string
	useKeyFile?: boolean,
	key?: any 
}

// NOTE: hashFunc for the browser is currently unimplemented but would look like:
// async (claimBody) => {
	// let encodedBody = new TextEncoder().encode(claimBody);
	// await crypto.subtle.digest('SHA-256', encodedBody)
// } 

// originate creates a new smart contract from a given wallet
// Returns nothing or throws an err
export async function originate(opts: SignerOpts, node_url: string, claim_urls: [string], verifyCredential: any, hashFunc: any, fetchFunc: any): Promise<string> {
    try {
        const Tezos = new taquito.TezosToolkit(node_url);
        Tezos.addExtension(new tzip16.Tzip16Module());
		let pkHash;
		if (opts.useWallet) {
			Tezos.setWalletProvider(opts.wallet);
			pkHash = await opts.wallet.getPKH()
		} else if (opts.useSecret) {
			Tezos.setProvider({
				signer: new InMemorySigner(opts.secret)
			});
			pkHash = await Tezos.signer.publicKeyHash();
		} else if (opts.useKeyFile) {
			await importKey(
				Tezos, 
				opts.key.email, 
				opts.key.password, 
				opts.key.mnemonic.join(' '), 
				opts.key.secret, 
			);
			pkHash = await Tezos.signer.publicKeyHash();
		} else {
			throw new Error("No signing method found in opts");
		}

		let claims = [];
		for (let i = 0, x = claim_urls.length; i < x; i++) {
			let claim_url = claim_urls[i];
			let nextClaim = await url_to_entry(claim_url, verifyCredential, hashFunc, fetchFunc);
			claims.push(nextClaim);
		}

		const metadataBigMap = new taquito.MichelsonMap();
		metadataBigMap.set("", tzip16.char2Bytes("https://gist.githubusercontent.com/sbihel/a9273df118862acba2b4d15a8778e3dd/raw/0debf54a941fdda9cfde4d34866535d302856885/tpp-metadata.json"));

		console.log("About to try origination")
		let originationOp, contractAddress;
		if (opts.useWallet) {
			console.log("In use wallet");
			let opSender = await Tezos.wallet.originate({
				code: contract,
				storage: {
					claims: claims,
					owner: pkHash,
					metadata: metadataBigMap,
				},
			})

			console.log("About to send")
			originationOp = await opSender.send();
			
			console.log("awaiting confimation")
			contractAddress = await originationOp.contract().address;
		} else {
			console.log("in use secret")
			originationOp = await Tezos.contract.originate({
				code: contract,
				storage: {
					claims: claims,
					owner: pkHash,
					metadata: metadataBigMap,
				},
			});
			console.log("awaiting confimation")
			await originationOp.confirmation(CONFIRMATION_CHECKS);
			contractAddress = originationOp.contractAddress;
		}

		console.log(`Origination of ${contractAddress} Complete`)

		return contractAddress;
	} catch (error) {
		console.error(error);
        throw error
	}
}

// add_entry takes a wallet, contract_address, and entry to store and called the add_entry
// command in the smart contract
export async function add_claim(opts: SignerOpts, contract_address: string, claim_url: string, node_url: string, verifyCredential: any, hashFunc: any, fetchFunc: any) {
    try {
        const Tezos = new taquito.TezosToolkit(node_url);
        Tezos.addExtension(new tzip16.Tzip16Module());
        if (opts.useWallet) {
			Tezos.setWalletProvider(opts.wallet);
		} else if (opts.useSecret) {
			Tezos.setProvider({
				signer: new InMemorySigner(opts.secret)
			});
		} else if (opts.useKeyFile) {
			await importKey(
				Tezos, 
				opts.key.email, 
				opts.key.password, 
				opts.key.mnemonic.join(' '), 
				opts.key.secret, 
			);
		} else {
			throw new Error("No signing method found in opts");
		}		

		let entry = await url_to_entry(claim_url, verifyCredential, hashFunc, fetchFunc);
		let contract = await
			Tezos.contract
				.at(contract_address);

		let op = await contract.methods.addClaim(entry).send();

		await op.confirmation(CONFIRMATION_CHECKS);

		let hash = op.hash;
	} catch (error) {
		console.error(error);
        throw error;
	}
}

export async function remove_claim(opts: SignerOpts, contract_address: string, claim_url: string, node_url: string, verifyCredential: any, hashFunc: any, fetchFunc: any) {
    try {
        const Tezos = new taquito.TezosToolkit(node_url);
        Tezos.addExtension(new tzip16.Tzip16Module());
		if (opts.useWallet) {
			Tezos.setWalletProvider(opts.wallet);
		} else if (opts.useSecret) {
			Tezos.setProvider({
				signer: new InMemorySigner(opts.secret)
			});
		} else if (opts.useKeyFile) {
			await importKey(
				Tezos, 
				opts.key.email, 
				opts.key.password, 
				opts.key.mnemonic.join(' '), 
				opts.key.secret, 
			);
		} else {
			throw new Error("No signing method found in opts");
		}

		let entry = await url_to_entry(claim_url, verifyCredential, hashFunc, fetchFunc);
		let contract = await
			Tezos.contract
				.at(contract_address);

		let op = await contract.methods.removeClaim(entry).send();

		await op.confirmation(CONFIRMATION_CHECKS);
		let hash = op.hash;
	} catch (error) {
		console.error(error);
        throw error;
	}
}

async function url_to_entry(claim_url: string, verifyCredential: any, hashFunc: any, fetchFunc: any): Promise<[string, any, string]> {
	let claimRes = await fetchFunc(claim_url);
	let claimBody = await claimRes.text();

	// TODO: Restore once this actually works.
	// Validate VC
	// let verifyResult = await verifyCredential(claimBody, '{}');
	// let verifyJSON = JSON.parse(verifyResult);
	// if (verifyJSON.errors.length > 0) throw verifyJSON.errors;

	// Hash VC
	let vcHash = await hashFunc(claimBody);
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


	console.log("Survived URLToEntry")
	return [claim_url, vcHashHex, t];
}


// retrieve_tpp finds a smart contract from it's owner's 
// returns an address if found, false if not, or throws and error if the network fails
export async function retrieve_tpp(bcd_url: string, address: string, network: string, fetchFunc: any) {
	let searchRes = await fetchFunc(`${bcd_url}/v1/search?q=${address}&n=${network}&i=contract`);
	let searchJSON = await searchRes.json()
	if (searchJSON.count == 0) {
		return false;
	}

	for (var item of searchJSON.items) {
		if (item.type != "contract") {
			continue
		}
		if (item.body.entrypoints.includes("addClaim") && item.body.entrypoints.includes("removeClaim")) {
			return item.value;
		}
	}

	return false;
}

// read_all lists all entries in the contract metadata
// export async function read_all(contract_address: string) {
// }

