<script type="ts">
  import { AvailableCredentials, LoadingSpinner, BasePage } from 'components';
  import { loadingContracts } from 'src/store';
</script>

<BasePage class="flex-col flex-wrap items-center justify-center flex flex-1 pt-18 sm:pt-22">
  <div class="flex flex-wrap justify-center w-full h-full">
    {#if $loadingContracts}
      <div
        class="flex flex-col self-center justify-around mx-4 md:mx-10 mb-16"
      >
        <LoadingSpinner
          class="rotating w-18 h-18 flex items-center justify-center"
        />
      </div>
    {:else}
      <div
        class="flex flex-col self-center justify-around overflow-auto mx-4 md:mx-10 mb-16"
      >
        <AvailableCredentials />
      </div>
    {/if}
  </div>
</BasePage>
