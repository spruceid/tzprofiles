<script type="ts">
  import {
    BasePage,
    PrimaryButton,
    TextBody2,
    Select,
    Option,
    Input,
    Label,
  } from 'components';

  import { search, selectedNetwork, claims } from 'src/store';
  import { onMount } from 'svelte';

  let address: string = '';
  let network: string;

  onMount(() => {
    network = $selectedNetwork;
  });

  selectedNetwork.subscribe((node) => (network = node));

  const setSelectedNetwork = () => {
    selectedNetwork.set(network);
  };
</script>

<svelte:head>
  <title>Tezos Profiles Viewer</title>
</svelte:head>

<BasePage class="items-center justify-center flex-wrap flex-col">
  <h1 class="lg:text-8xl sm:text-7xl text-6xl">Tezos Profiles Viewer</h1>

  <TextBody2
    value="Tezos Profiles Viewer enables you to search for a Tezos Profile using
     a Tezos Address"
    class="text-center my-8"
  />
  <div class="flex flex-col items-center">
    <Label fieldName="network" value="Choose a network" class="text-white" />
    <Select
      name="network"
      id="network"
      bind:value={network}
      onChange={setSelectedNetwork}
    >
      <Option value="mainnet" text="mainnet" selected />
      <Option value="delphinet" text="delphinet" />
      <Option value="edo2net" text="edo2net" />
      <Option value="sandboxnet" text="sandboxnet" />
    </Select>
    <div class="flex items-center mt-8">
      <Input placeholder="Enter a Tezos address" bind:value={address} />
      <PrimaryButton
        class="m-4"
        onClick={() => search(address)}
        text="Find"
        small
      />
    </div>
  </div>

  {#if claims['BasicProfile'] || claims['TwitterProfile']}
    <div>
      <h3>{address} had the following claims</h3>
      <p>Basic Profile</p>
      {#if claims['BasicProfile']}
        <p>Will Be Basic Profile Claims</p>
      {:else}
        <p>User is missing Basic Profile Claims</p>
      {/if}
      <p>Twitter Profile</p>
      {#if claims['TwitterProfile']}
        <p>Will Be Twitter Claims</p>
      {:else}
        <p>User is missing Twitter Claims</p>
      {/if}
    </div>
  {/if}
</BasePage>
