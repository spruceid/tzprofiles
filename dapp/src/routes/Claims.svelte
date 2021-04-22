<script type="ts">
  import { AvailableCredentials, Profile, MyCredentials } from 'components';
  import { claimsStream, loadingContracts } from 'src/store';
  import type { ClaimMap } from 'src/store';

  let claims: ClaimMap;

  claimsStream.subscribe((allClaims) => {
    claims = allClaims;
  });
</script>

<div class="flex flex-wrap justify-center w-full h-full">
  <Profile />
  <div
    class="flex flex-col self-center justify-around overflow-hidden md:mx-10"
  >
    {#if $loadingContracts}
      <p>Looking for contract...</p>
    {:else}
      <AvailableCredentials />
      <MyCredentials />
    {/if}
  </div>
</div>
