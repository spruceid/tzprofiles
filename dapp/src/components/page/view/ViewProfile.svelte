<script lang="ts">
  import PublicProfileView from './PublicProfileView.svelte';

  import type { Writable } from 'svelte/store';
  import type { ClaimMap } from 'src/helpers';

  export let claimsMap: Writable<ClaimMap>;
  export let network: string = 'mainnet';
</script>

<PublicProfileView claimsMap={$claimsMap} />
