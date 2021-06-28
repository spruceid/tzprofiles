const lib = require('../dist/tzprofiles');
const crypto = require('crypto');
const fs = require('fs');
const yargs = require('yargs');
const kepler = require('kepler-sdk');
const DIDKit = require('didkit-wasm-node');

const hashFunc = async (claimBody) => {
	return crypto.createHash("sha256").update(claimBody).digest().toString('hex');
}

const argv = yargs
	.command('originate', 'Deploy Tezos Public Profiles smart contract.', {
		claims: {
			description: 'Comma seperated list of urls to claims',
			type: 'array',
			demand: false,
			default: [],
		}
	})
	.command('add-claims', 'Add a claim.',
		{
			contract: {
				description: 'TZP address.',
				type: 'string',
				demand: true,
			},
			claims: {
				description: 'Comma seperated list of urls to claims',
				type: 'array',
				demand: true,
			}
		}
	)
	.command('remove-claims', 'Remove a claim.',
		{
			contract: {
				description: 'TZP address.',
				type: 'string',
				demand: true,
			},
			claims: {
				description: 'Comma seperated list of urls to claims',
				type: 'array',
				demand: true,
			}
		}
	)
	.command('get-claims', 'Get claims.',
		{
			contract: {
				description: 'TPP address.',
				type: 'string',
				demand: false,
			},
			subject: {
				description: 'TPP Subject address.',
				type: 'string',
				demand: false,
			}
		}
	)
	.command('get-subject', 'Get the subject for a Tezos Public Profile smart contract.',
		{
			contract: {
				description: 'TPP address.',
				type: 'string',
				demand: true,
			}
		}
	)
	.command('resolve-tzp', 'Get the TZP address for a Tezos Wallet address.',
		{
			address: {
				description: 'Tezos account address.',
				type: 'string',
				demand: true,
			}
		}
	)
	.command('resolve-claims', 'Get the TZP claims for a Tezos Wallet address.',
		{
			address: {
				description: 'Tezos account address.',
				type: 'string',
				demand: true,
			}
		}
	)
	.option('url', {
		alias: 'u',
		description: 'Tezos node.',
		type: 'string',
		default: 'https://api.tez.ie/rpc/mainnet',
	})
	.option('network', {
		alias: 'n',
		description: 'Tezos network.',
		type: 'string',
		default: 'mainnet'
	})
	.option('faucet_key_file', {
		alias: 'f',
		description: 'Path to a faucet key JSON file.',
		type: 'string',
	})
	.option('secret', {
		alias: 's',
		description: 'Secret key.',
		type: 'string',
	})
	.option('tzkt_base', {
		alias: 'b',
		description: 'Base url for TzKT API endpoints',
		type: 'string',
		default: 'https://api.mainnet.tzkt.io'
	})
	.option('kepler_base', {
		alias: 'k',
		description: 'Base url for kepler API server',
		type: 'string',
		default: 'https://kepler.tzprofiles.com'
	})
	.strict()
	.help()
	.alias('help', 'h')
	.argv;

async function resolveClaim(url) {
	let res = await fetch(url);
	if (!res.ok || res.status !== 200) {
		throw new Error(`Error resolving claim url: ${url}, status text: ${res.statusText}`)
	}

	return await res.text();
};

function getClient() {
	let signerOpts = {};
	if (argv.faucet_key_file) {
		signerOpts.type = "key";
		signerOpts.key = JSON.parse(fs.readFileSync(argv.faucet_key_file, 'utf8'));
	} else if (argv.secret) {
		signerOpts.type = "secret";
		signerOpts.secret = argv.secret
	} else {
		signerOpts = false;
	}

	let clientOpts = {
		tzktBase: argv.tzkt_base,
		keplerClient: new kepler.Kepler(
			argv.kepler_base
		),
		hashContent: hashFunc,
		nodeURL: argv.url || "https://mainnet-tezos.giganode.io",
		signer: signerOpts,
		validateType: async (c, t) => {
			// Validate VC
			switch (t) {
				case "VerifiableCredential": {
					let verifyResult = await DIDKit.verifyCredential(c, '{}');
					let verifyJSON = JSON.parse(verifyResult);
					if (verifyJSON.errors.length > 0) throw new Error(verifyJSON.errors.join(", "));
					break;
				}
				default:
					throw new Error(`Unknown ClaimType: ${t}`);
			}
		}
	};

	return new lib.TZProfilesClient(clientOpts);
}

async function retrieve_tzp() {
	let client = getClient();
	return await client.retrieve(argv.address);
}

async function originate() {
	let client = getClient();

	let claimsList = argv.claims.map((claim) => {
		return ["VerifiableCredential", claim];
	});

	return await client.originate(claimsList);
}

async function add_claims() {
	let client = getClient();
	let claimsList = argv.claims.map((claim) => {
		return ["VerifiableCredential", claim];
	});

	return await client.addClaims(argv.contract, claimsList)
}

async function remove_claims() {
	let client = getClient();
	let claimsList = argv.claims.map((claim) => {
		return ["VerifiableCredential", claim];
	});

	return await client.removeClaims(argv.contract, claimsList)
}

async function run() {
	try {
		if (argv._.includes('originate')) {
			let contractAddress = await originate();
			console.log(`Originated contract at address: ${contractAddress}`);
		} else if (argv._.includes('add-claims')) {
			let transaction = await add_claims();
			console.log(`Add claims concluded in transaction: ${transaction}`);
		} else if (argv._.includes('remove-claims')) {
			let transaction = await remove_claims();
			console.log(`Remove claims concluded in transaction: ${transaction}`);
		} else if (argv._.includes('resolve-tzp')) {
			let tzp = await retrieve_tzp();
			console.log(`Wallet ${argv.address} owns contract:`);
			console.log(tzp);
		} else {
			throw new Error(`Unknown command`);
		}
	} catch (e) {
		console.error(`Failed in operation: ${e.message}`);
	}
}

run().then(() => {console.log("Exiting")});
