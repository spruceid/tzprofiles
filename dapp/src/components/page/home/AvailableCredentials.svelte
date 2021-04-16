<script lang="ts">
  import { useNavigate } from 'svelte-navigator';
  import { claimsStream, loadingContracts } from 'src/store';

  let navigate = useNavigate();
</script>

<div class="flex flex-col mt-8 xl:mt-0">
  <h3 class="text-xl mb-4">Available Credentials</h3>
  {#if $loadingContracts}
    Loading...
  {:else if Object.values($claimsStream).every((claim) => claim.url)}
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
          {#if !$claimsStream[claim].url}
            <tr>
              <td
                class="my-1 sm:px-4 md:px-6 px-2 flex items-center cursor-pointer"
                on:click={() => navigate($claimsStream[claim].route)}
              >
                <svelte:component
                  this={$claimsStream[claim].icon()}
                  class="w-10 sm:w-4 h-12 sm:h-4 mr-3"
                />
                <p class="font-bold">{$claimsStream[claim].display}</p>
              </td>
              <td class="sm:px-4 md:px-6 px-2">
                {$claimsStream[claim].type}
              </td>
              <td class="sm:px-4 md:px-6 px-2">
                {$claimsStream[claim].proof}
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  {/if}
</div>
