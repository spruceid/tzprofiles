<script lang="ts">
  import Basic from './Basic.svelte';
  import Ethereum from './Ethereum.svelte';
  import Twitter from './Twitter.svelte';
  import Discord from './Discord.svelte';
  import type { Claim } from 'src/helpers';

  export let claim: Claim;
</script>

{#if claim?.type === 'basic'}
  <Basic basicClaim={claim} />
{:else if claim?.type === 'ethereum'}
  <Ethereum ethereumClaim={claim} />
{:else if claim?.type === 'twitter'}
  <Twitter twitterClaim={claim} />
{:else if claim?.type === 'discord'}
  <Discord {claim} />
{:else}
  <div>Unknown claim type: {claim?.type}</div>
{/if}
