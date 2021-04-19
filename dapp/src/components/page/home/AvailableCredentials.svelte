<script lang="ts">
  import { useNavigate } from 'svelte-navigator';
  import { claimsStream, loadingContracts } from 'src/store';

  let navigate = useNavigate();
</script>

<div class="flex flex-col my-8">
  <h3 class="mb-4 text-xl">Available Credentials</h3>
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
                class="flex items-center px-2 my-1 cursor-pointer sm:px-4 md:px-6"
                on:click={() => navigate($claimsStream[claim].route)}
              >
                <svelte:component
                  this={$claimsStream[claim].icon()}
                  class="w-10 h-12 mr-3 sm:w-4 sm:h-4"
                />
                <p class="font-bold">{$claimsStream[claim].display}</p>
              </td>
              <td class="px-2 sm:px-4 md:px-6">
                {$claimsStream[claim].type}
              </td>
              <td class="px-2 sm:px-4 md:px-6">
                {$claimsStream[claim].proof}
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  {/if}
</div>
