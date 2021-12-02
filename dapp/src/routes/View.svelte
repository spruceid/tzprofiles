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

<BasePage class="justify-center flex flex-col items-center">
  {#if fetching}
    <div class="items-center justify-center w-full mb-8 flex">
      <LoadingSpinner class="rotating" />
    </div>
  {/if}

  {#if !fetching}
    <PublicProfileView claimsMap={$searchClaims} />
  {/if}
</BasePage>
