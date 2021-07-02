<script type="ts">
  import { AvailableCredentials, LoadingSpinner, BasePage } from 'components';
  import { loadingContracts } from 'src/store';
</script>

<BasePage class="flex-col flex-wrap items-center justify-center">
  <div class="flex flex-wrap justify-center w-full h-full">
    <div
      class="flex flex-col self-center justify-around overflow-visible md:mx-10"
    >
      {#if $loadingContracts}
        <LoadingSpinner class="rotating" />
      {:else}
        <AvailableCredentials />
      {/if}
    </div>
  </div>
</BasePage>
