<script lang="ts">
  import { BasePage, Profile } from 'components';
  import { useParams } from 'svelte-navigator';
  import { onMount } from 'svelte';
  import { claims, search, selectedNetwork } from 'src/store';

  const params = useParams();

  onMount(() => {
    if (!$claims.BasicProfile || !$claims.TwitterProfile) {
      selectedNetwork.set($params.network || 'mainnet');
      search($params.address);
    }
  });
</script>

<BasePage class="justify-center">
  <Profile address={$params.address} network={$params.network} />
</BasePage>
