<script lang="ts">
  import { onMount } from 'svelte';
  import { useParams } from 'svelte-navigator';
  import { claims, defaultSearchOpts, search, network } from 'src/store';
  import type NetworkType from 'enumsNetworkType';
  import { BasePage, ViewProfile } from 'components';

  const params = useParams();

  onMount(() => {
    if (!$claims.BasicProfile || !$claims.TwitterProfile) {
      network.set(
        ($params.network as NetworkType) || ('mainnet' as NetworkType)
      );
      search($params.address, defaultSearchOpts);
    }
  });
</script>

<BasePage class="justify-center">
  <ViewProfile address={$params.address} network={$params.network} />
</BasePage>
