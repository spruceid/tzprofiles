<script lang="ts">
  import { useNavigate } from 'svelte-navigator';
  import { claimsStream, loadingContracts } from 'src/store';

  let navigate = useNavigate();
</script>

<div class="flex flex-col my-8">
  <h3 class="mb-4 text-xl">Available Credentials</h3>
  {#if $loadingContracts}
    Loading...
  {:else if Object.values($claimsStream).every((claim) => claim.irl)}
    <h4>None Currently Available</h4>
  {:else}
    <table class="table-auto">
      <thead>
        <th>NAME</th>
        <th>TYPE</th>
        <th>PROOF</th>
      </thead>
      <tbody>
        {#each Object.values($claimsStream) as claim}
          {#if !claim.content && !claim.preparedContent}
            <tr>
              <td
                class="flex items-center px-2 my-1 cursor-pointer sm:px-4 md:px-6"
                on:click={() => navigate(claim.display.route)}
              >
                <svelte:component
                  this={claim.display.icon}
                  class="w-10 h-12 mr-3 sm:w-4 sm:h-4"
                />
                <p class="font-bold">{claim.display.display}</p>
              </td>
              <td class="px-2 sm:px-4 md:px-6">
                {claim.display.type}
              </td>
              <td class="px-2 sm:px-4 md:px-6">
                {claim.display.proof}
              </td>
              {#if claim.preparedContent}
                <td class="px-2 sm:px-4 md:px-6"> (Unsaved changes) </td>
              {/if}
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  {/if}
</div>
