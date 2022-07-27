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
  import NetworkType from 'enums/NetworkType';
  import { BasePage, LoadingSpinner, PublicProfileView } from 'components';

  const params = useParams();
  if ($params.address) {
    searchAddress.set($params.address);
  }

  $: fetching = false;

  onMount(() => {
    // TODO: Generalize over claim types?
    if (!$searchClaims?.basic.content || !$searchClaims?.twitter.content) {
      const n = $params.network;
      if (Object.values(NetworkType).includes(n as NetworkType)) {
        network.set(n as NetworkType);
      } else {
        network.set(NetworkType.MAINNET)
      }

      fetching = true;
      search($params.address, defaultSearchOpts).finally(() => {
        fetching = false;
      });
    }
  });
</script>

<BasePage class="flex flex-col flex-1 justify-center items-center mx-4 pt-18 sm:pt-22">
  {#if fetching}
    <div class="items-center justify-center w-full mb-8 flex">
      <LoadingSpinner class="rotating w-18 h-18 flex items-center justify-center" />
    </div>
  {/if}

  {#if !fetching}
    <PublicProfileView claimsMap={$searchClaims} />
  {/if}
</BasePage>
