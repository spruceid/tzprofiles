<script lang="ts">
  import { claimsStream, loadingContracts } from 'src/store';
</script>

<div class="flex flex-col mt-8 xl:mt-0">
  <h3 class="text-xl mb-4">My Credentials</h3>
  {#if $loadingContracts}
    Loading...
  {:else if Object.values($claimsStream).every((claim) => !claim.url)}
    <h4>None Currently Available</h4>
  {:else}
    <table class="table-auto">
      <thead>
        <th>NAME</th>
        <th>TYPE</th>
        <th>PROOF</th>
      </thead>
      <tbody>
        {#each Object.keys($claimsStream) as claim}
          {#if $claimsStream[claim].url}
            <tr>
              <td class="px-8 flex items-center">
                <svelte:component
                  this={$claimsStream[claim].icon()}
                  class="w-4 h-4 mr-3"
                />
                <p class="font-bold">{$claimsStream[claim].display}</p>
              </td>
              <td class="px-8">
                {$claimsStream[claim].type}
              </td>
              <td class="px-8">
                {$claimsStream[claim].proof}
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  {/if}
</div>
