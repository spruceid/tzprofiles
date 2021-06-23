<script lang="ts">
  import { useNavigate } from 'svelte-navigator';
  import { claimsStream, loadingContracts } from 'src/store';
  import './availablecredentials.scss';

  let navigate = useNavigate();
</script>

<div class="table-container">
  <div class="header-row-container">
    <div class="body">Available Credentials</div>
  </div>
  {#if $loadingContracts}
    Loading...
  {:else if Object.values($claimsStream).every((claim) => claim.irl)}
    <h4>None Currently Available</h4>
  {:else}
    <table id="credential" class="w-full">
      <tr>
        <th class="text-left">Name</th>
        <th class="text-left">Type</th>
        <th class="text-left">Proof</th>
      </tr>
      <tbody>
        {#each Object.values($claimsStream) as claim}
          {#if !claim.content && !claim.preparedContent}
            <tr>
              <td
                class="px-2 my-1 cursor-pointer sm:px-4 md:px-6 text-left flex flex-row items-center"
                on:click={() => navigate(claim.display.route)}
              >
                <svelte:component
                  this={claim.display.icon}
                  class="w-10 h-12 mr-3 sm:w-4 sm:h-4"
                />
                <p>{claim.display.display}</p>
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
