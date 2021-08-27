<script lang="ts">
  import { onMount } from 'svelte';
  import { useParams } from 'svelte-navigator';
  import {
    findAddressFromDomain,
    searchClaims,
    searchAddress,
    defaultSearchOpts,
    search,
    network,
  } from 'src/store';
  import type NetworkType from 'enumsNetworkType';
  import { BasePage, LoadingSpinner, PublicProfileView } from 'components';

  const params = useParams();
  if ($params.address) {
    searchAddress.set($params.address);
  }

  $: fetching = false;

  onMount(async () => {
    if (Object.values($searchClaims).filter((x) => !!x.content).length === 0) {
      network.set(
        ($params.network as NetworkType) || ('mainnet' as NetworkType)
      );
      fetching = true;

      let tempAddress = $searchAddress.trim();

      try {
        if (tempAddress.endsWith('.tez')) {
          tempAddress = await findAddressFromDomain(tempAddress);
        }

        await search(tempAddress, defaultSearchOpts);
      } catch (err) {
        alert.set({
          message: err?.message || `Failed in search ${JSON.stringify(err)}`,
          variant: 'error',
        });
      } finally {
        fetching = false;
      }
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
