<script lang="ts">
	import * as contractLib from "tezospublicprofiles";
	$: showResults = false;
	$: errorMessage = "";
	$: nodeHost = "mainnet";
	$: claims = {
		CoreProfile: false,
		TwitterProfile: false,
	};

	let wallet: string;

	const getBetterCallDevPrefix = () => {
		return nodeHost === "mainnet"
			? "https://api.better-call.dev"
			: "http://localhost:14000";
	};

	const search = async () => {
		errorMessage = "";

		if (wallet) {
			let found: false | [[string, string, string]] = false;
			try {
				found = await contractLib.retrieve_tpp_claims(
					getBetterCallDevPrefix(),
					wallet,
					nodeHost,
					fetch
				);
			} catch (err) {
				if (err.message) {
					errorMessage = err.message;
				} else {
					errorMessage = "Network error";
				}
				return;
			}

			if (found) {
				let tripleClaims = found;
				let nextClaims = {};
				for (let i = 0, n = tripleClaims.length; i < n; i++) {
					let [url, hash, key] = tripleClaims[i];
					nextClaims[key] = {
						url,
						hash,
						content: null,
						errorMessage: ''
					}
					// TODO: follow URL, test hash, display results.
				}

				claims = nextClaims;
				showResults = true;
				return;
			}
		}

		errorMessage = `No contract found for ${wallet}`;
	};
</script>

<main>
	<h2>Tezos Public Profile</h2>
	{#if errorMessage}
		<div>
			<p style="color:red;">{errorMessage}</p>
		</div>
	{/if}
	<div>
		<label for="network">Mainnet or Local?</label>
		<select bind:value={nodeHost}>
			<option value="mainnet" default>mainnet</option>
			<option value="sandboxnet">sandboxnet</option>
		</select>
	</div>
	<div>
		<label for="search">Find by address: </label>
		<input bind:value={wallet} />
		<button on:click={search}>Search</button>
	</div>
	{#if showResults}
		<div>
			<h3>{wallet} had the following claims</h3>
			<p>Core Profile</p>
			{#if claims["CoreProfile"]}
				<p>Will Be Core Profile Claims</p>
			{:else}
				<p>User is missing Core Profile Claims</p>
			{/if}
			<p>Twitter Profile</p>
			{#if claims["TwitterProfile"]}
				<p>Will Be Twitter Claims</p>
			{:else}
				<p>User is missing Twitter Claims</p>
			{/if}
		</div>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
