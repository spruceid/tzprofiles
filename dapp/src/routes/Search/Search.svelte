<script lang="ts">
  import {
    BasePage,
    PrimaryButton,
    Select,
    Option,
    Input,
    LoadingSpinner,
  } from 'components';
  import { useNavigate } from 'svelte-navigator';
  import { onMount } from 'svelte';
  import { defaultSearchOpts, search, network, alert } from 'src/store';
  import type NetworkType from 'enumsNetworkType';
  import { findAddressFromDomain } from './searchHelper';
  import './search.scss';

  const navigate = useNavigate();

  let address: string = '';
  let localNetwork: string;
  let searching: boolean = false;

  onMount(() => {
    localNetwork = $network;
  });

  const handleKeydown = (event) => {
    if (event.key == 'Enter') {
      event.preventDefault();
      searchProfiles();
    }
  };

  const setSelectedNetwork = () => {
    network.set(localNetwork as NetworkType);
  };

  const searchProfiles = async () => {
    try {
      searching = true;
      let searchingAddress = address.trim();

      if (address.endsWith('.tez')) {
        searchingAddress = await findAddressFromDomain(address);
      }
      await search(searchingAddress, defaultSearchOpts);
      navigate(`/view/${localNetwork}/${searchingAddress}`);
    } catch (err) {
      alert.set({
        message: err?.message || `Failed in search ${JSON.stringify(err)}`,
        variant: 'error',
      });
    } finally {
      searching = false;
    }
  };
</script>

<svelte:window on:keydown={handleKeydown} />

<BasePage
  class="flex flex-col items-center justify-center mx-4 flex-1 pt-18 sm:pt-22 md:pt-34"
>
  <div class="search-container dropshadow-default fade-in">
    <div class="mb-4 text-2xl text-left font-bold body">
      Tezos Profiles Explorer
    </div>
    <div class="mb-12">
      Tezos Profiles Explorer enables you to search for a Tezos Profile using a
      Tezos Address
    </div>
    <div class="flex flex-col sm:flex-row items-center mt-8 justify-between">
      {#if !searching}
        <div
          class="flex items-center relative sm:max-w-60 w-full ml-0 cursor-pointer sm:mr-4 sm:mb-0 mb-4 search-wrap"
        >
          <Select
            name="network"
            id="network"
            bind:value={localNetwork}
            onChange={setSelectedNetwork}
            class="w-full"
          >
            <Option value="mainnet" text="mainnet" selected />
            <Option value="ghostnet" text="ghostnet" />
            <Option value="custom" text="localhost" />
          </Select>
          <div
            class="absolute flex items-center justify-center top-0 right-0 w-10 h-full bg-transparent"
          >
            <div class="arrow down" />
          </div>
        </div>
        <Input
          placeholder="Enter Tezos address or domain"
          bind:value={address}
          name="address-search"
          fluid
        />
        <PrimaryButton
          class="ml-4 min-w-25 sm:mt-0 mt-4"
          onClick={() => searchProfiles()}
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
