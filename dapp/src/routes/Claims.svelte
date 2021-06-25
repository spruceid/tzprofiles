<script type="ts">
  import {
    AvailableCredentials,
    DownloadableCredentials,
    Profile,
    MyCredentials,
    LoadingSpinner,
  } from 'components';
  import { loadingContracts } from 'src/store';
</script>

<div class="flex flex-wrap justify-center w-full h-full">
  <div
    class="flex flex-col self-center justify-around overflow-visible md:mx-10"
  >
    {#if $loadingContracts}
      <LoadingSpinner class="rotating" />
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
