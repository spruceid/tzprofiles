<script lang="ts">
  import { claimToOutlink } from 'src/helpers';
  import type { Claim } from 'src/helpers';

  export let claim: Claim;
</script>

<a href={claimToOutlink(claim.type, claim)} target="_blank" class="mr-2">
  <div class="social-icon-container">
    <svelte:component this={claim.display.icon} />
  </div>
</a>
