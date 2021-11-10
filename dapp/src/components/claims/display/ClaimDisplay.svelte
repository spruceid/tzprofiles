<script lang="ts">
  import Basic from './Basic.svelte';
  import Ethereum from './Ethereum.svelte';
  import Twitter from './Twitter.svelte';
  import Discord from './Discord.svelte';
  import Dns from './Dns.svelte';
  import GitHub from './GitHub.svelte';
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
{:else if claim?.type === 'dns'}
  <Dns {claim} />
{:else if claim?.type === 'github'}
  <GitHub {claim} />
{:else}
  <div>Unknown claim type: {claim?.type}</div>
{/if}