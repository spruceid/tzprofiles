<script type="ts">
  import {
    AvailableCredentials,
    DownloadableCredentials,
    Profile,
  } from 'components';
  import { loadingContracts } from 'src/store';
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
      <!-- <DownloadableCredentials
        heading="Unsaved Credentials"
        filterType="preparedContent"
      />
      <DownloadableCredentials heading="My Credentials" filterType="content" /> -->
      <!-- <MyCredentials /> -->
    {/if}
  </div>
</div>
