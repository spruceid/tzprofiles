const lib = require('../dist/lib');
const crypto = require('crypto');
const fs = require('fs');
const yargs = require('yargs');
const fetch = require('node-fetch');

const DIDKit = require('../../../didkit/lib/web/pkg/node/didkit_wasm');

const hashFunc = async (claimBody) => {
	return crypto.createHash("sha256").update(claimBody).digest().toString('hex');
}

const argv = yargs
	.command('originate', 'Deploy Tezos Public Profiles smart contract.', {
		claims: {
			description: 'Comma seperated list of urls to claims',
			type: 'array',
			demand: false,
		}
	})
	.command('add-claim', 'Add a claim.',
		{
			contract: {
				description: 'TPP address.',
				type: 'string',
				demand: true,
			},
			claim_url: {
				description: 'URL of the VC.',
				alias: 'claim',
				type: 'string',
				demand: true,
			}
		}
	)
	.command('remove-claim', 'Remove a claim.',
		{
			contract: {
				description: 'TPP address.',
				type: 'string',
				demand: true,
			},
			claim_url: {
				description: 'URL of the claim.',
				alias: 'claim',
				type: 'string',
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
	.command('resolve-tpp', 'Get the TPP for a Tezos address.',
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
	.option('bcd_url', {
		alias: 'b',
		description: 'better-call.dev API endpoint',
		type: 'string',
		default: 'https://api.better-call.dev/'
	})
	.strict()
	.help()
	.alias('help', 'h')
	.argv;

async function resolve_tpp() {
	try {
		let tpp = await lib.retrieve_tpp(argv.bcd_url, argv.address, argv.network, fetch);
		console.log(tpp);
	} catch (error) {
		console.error(error);
		throw error;
	}
}

if (argv._.includes('originate')) {
	let opts = {};
	if (argv.faucet_key_file) {
		opts.useKeyFile = true;
		opts.key = JSON.parse(fs.readFileSync(argv.faucet_key_file, 'utf8'));
	} else if (argv.secret) {
		opts.useSecret = true;
		opts.secret = argv.secret
	}
	lib.originate(opts, argv.url, argv.claims, DIDKit.verifyCredential, hashFunc, fetch)
} else if (argv._.includes('add-claim')) {
	let opts = {};
	if (argv.faucet_key_file) {
		opts.useKeyFile = true;
		opts.key = JSON.parse(fs.readFileSync(argv.faucet_key_file, 'utf8'));
	} else if (argv.secret) {
		opts.useSecret = true;
		opts.secret = argv.secret
	}
	lib.add_claim(opts, argv.contract, argv.claim_url, argv.url, DIDKit.verifyCredential, hashFunc, fetch)
} else if (argv._.includes('remove-claim')) {
	lib.remove_claim(opts, argv.contract, argv.claim_url, argv.url, DIDKit.verifyCredential, hashFunc, fetch);
} else if (argv._.includes('resolve-tpp')) {
	resolve_tpp();
}
