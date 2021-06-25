<script lang="ts">
  import { onMount } from 'svelte';
  import { useParams } from 'svelte-navigator';
  import {
    searchClaims,
    searchAddress,
    defaultSearchOpts,
    search,
    network,
  } from 'src/store';
  import type NetworkType from 'enumsNetworkType';
  import { BasePage, ViewProfile, LoadingSpinner } from 'components';

  const params = useParams();
  if ($params.address) {
    searchAddress.set($params.address);
  }

  $: fetching = false;

  onMount(() => {
    // TODO: Generalize over claim types?
    if (!$searchClaims?.basic.content || !$searchClaims?.twitter.content) {
      network.set(
        ($params.network as NetworkType) || ('mainnet' as NetworkType)
      );
      fetching = true;
      search($params.address, defaultSearchOpts).finally(() => {
        fetching = false;
      });
    }
  });
</script>

<BasePage class="justify-center flex flex-col items-center">
  {#if fetching}
    <div class="items-center justify-center w-full mb-8 flex">
      <LoadingSpinner class="rotating" />
    </div>
  {/if}

  {#if !fetching}
    <ViewProfile
      claimsMap={searchClaims}
      address={$searchAddress}
      network={$params.network}
    />
  {/if}
</BasePage>
