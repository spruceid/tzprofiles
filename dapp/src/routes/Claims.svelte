<script type="ts">
  import { AvailableCredentials, Profile, MyCredentials } from 'components';
  import { claimsStream, loadingContracts } from 'src/store';
  import type { Claim } from 'src/store';

  let claims: Claim = {};

  claimsStream.subscribe((allClaims) => {
    claims = allClaims;
  });
</script>

<div class="flex h-full w-full flex-wrap justify-center">
  <Profile />
  <div class="flex flex-col md:mx-10 justify-around">
    {#if $loadingContracts}
      <p>Looking for contract...</p>
    {:else}
      <AvailableCredentials />
      <MyCredentials />
    {/if}
  </div>
</div>
