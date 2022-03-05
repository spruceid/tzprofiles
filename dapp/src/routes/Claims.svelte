<script type="ts">
  import { AvailableCredentials, LoadingSpinner, BasePage } from 'components';
  import { loadingContracts } from 'src/store';
</script>

<BasePage class="flex-col flex-wrap items-center justify-center flex flex-1">
  <div class="flex flex-wrap justify-center w-full h-full">
    <div
      class="flex flex-col self-center justify-around overflow-auto mx-4 md:mx-10 mb-16"
    >
      {#if $loadingContracts}
        <LoadingSpinner class="rotating" />
      {:else}
        <AvailableCredentials />
      {/if}
    </div>
  </div>
</BasePage>
