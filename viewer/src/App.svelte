<script lang="ts">
	import * as contractLib from "tezospublicprofiles";
	$: showResults = false;
	$: errorMessage = "";
	$: nodeHost = "mainnet";
	$: contractJSON = null;

	let wallet: string;

	const getBetterCallDevPrefix = () => {
		return nodeHost === "mainnet"
			? "https://api.better-call.dev"
			: "http://localhost:14000";
	};

	const search = async () => {
		errorMessage = "";

		if (wallet) {
			let found = false;
			try {
				found = await contractLib.retrieve_tpp(
					getBetterCallDevPrefix(),
					wallet,
					nodeHost,
					fetch
				);
			} catch (err) {
				if (err.message) {
					errorMessage = err.message
				} else {
					errorMessage = "Network error"
				}
				return;
			}

			if (found) {
				contractJSON = found;
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
	{#if showResults && contractJSON}
		<div>
			<p>{JSON.stringify(contractJSON)}</p>
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

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
