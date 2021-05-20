<script lang="ts">
  import {
    BasePage,
    PrimaryButton,
    TextBody2,
    Select,
    Option,
    Input,
    Label,
    SpinnerIcon,
  } from 'components';
  import { useNavigate } from 'svelte-navigator';
  import { onMount } from 'svelte';
  import { defaultSearchOpts, search, network } from 'src/store';
  import type NetworkType from 'enumsNetworkType';

  const navigate = useNavigate();

  let address: string = '';
  let localNetwork: string;
  let searching: boolean = false;

  onMount(() => {
    localNetwork = $network;
  });

  const setSelectedNetwork = () => {
    network.set(localNetwork as NetworkType);
  };
</script>

<BasePage class="flex-col flex-wrap items-center justify-center">
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
      bind:value={localNetwork}
      onChange={setSelectedNetwork}
    >
      <Option value="mainnet" text="mainnet" selected />
      <Option value="edonet" text="edonet" />
      <Option value="florencenet" text="florencenet" />
      <Option value="sandboxnet" text="localhost" />
    </Select>
    <div class="flex items-center mt-8">
      {#if !searching}
        <Input placeholder="Enter a Tezos address" bind:value={address} />
        <PrimaryButton
          class="m-4"
          onClick={() => {
            searching = true;
            search(address, defaultSearchOpts)
              .then(() => {
                navigate(`/view/${localNetwork}/${address}`);
              })
              .finally(() => (searching = false));
          }}
          text="Find"
          small
        />
      {:else}
        <SpinnerIcon class="w-15 h-15 text-center animate-spin" />
      {/if}
    </div>
  </div>
</BasePage>
