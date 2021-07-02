<script lang="ts">
  import {
    BasePage,
    PrimaryButton,
    Select,
    Option,
    Input,
    Label,
    LoadingSpinner,
  } from 'components';
  import { useNavigate } from 'svelte-navigator';
  import { onMount } from 'svelte';
  import { defaultSearchOpts, search, network } from 'src/store';
  import type NetworkType from 'enumsNetworkType';
  import './search.scss';

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

<BasePage class="flex flex-col items-center justify-center">
  <div class="search-container dropshadow-default fade-in">
    <div class="mb-4 text-2xl text-left font-bold body">
      Tezos Profiles Explorer
    </div>
    <div class="mb-12">
      Tezos Profiles Explorer enables you to search for a Tezos Profile using a
      Tezos Address
    </div>
    <div class="flex items-center mt-8">
      {#if !searching}
        <Select
          name="network"
          id="network"
          bind:value={localNetwork}
          onChange={setSelectedNetwork}
          class="mr-2"
        >
          <Option value="mainnet" text="mainnet" selected />
          <Option value="edonet" text="edonet" />
          <Option value="florencenet" text="florencenet" />
          <Option value="custom" text="localhost" />
        </Select>
        <Input
          placeholder="Enter a Tezos address"
          bind:value={address}
          name="address-search"
        />
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
        <LoadingSpinner
          class="w-15 h-15 text-center animate-spin w-100 mx-auto"
        />
      {/if}
    </div>
  </div>
</BasePage>
