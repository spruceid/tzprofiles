<script lang="ts">
  import { onMount } from 'svelte';
  import { useNavigate } from 'svelte-navigator';
  import { claimsStream, loadingContracts, contractAddress } from 'src/store';
  import './availablecredentials.scss';
  import { IconLink, DownloadIcon } from 'components';
  import { PrimaryButton } from 'components/buttons';
  import { canUpload } from './uploadHelpers';

  const makeDownloadable = (obj: any): string => {
    let stringify = JSON.stringify(obj, null, 2);
    let encoded = encodeURIComponent(stringify);
    return `data:application/json;charset=utf-8,${encoded}`;
  };

  let navigate = useNavigate();
  let data: any[] = [];

  onMount(async () => {
    try {
      if (
        !Object.values($claimsStream).every(
          (claim) => !claim.content && !claim.preparedContent
        )
      ) {
        data = await Promise.all(
          Object.values($claimsStream)
            // TODO: Distinguish between content and preparedContent in UI
            .filter((claim) => claim.content || claim.preparedContent)
            .map(async (claim) => {
              // TODO: Distinguish between content and preparedContent in UI
              let json = makeDownloadable(
                claim.content || claim.preparedContent
              );
              return { ...claim, json };
            })
        );
      }
    } catch (err) {
      console.error(`Died in MyCredentials OnMount ${err.message}`);
    }
  });
</script>

<div class="table-container">
  <div class="header-row-container">
    <div class="body flex flex-row items-center w-full justify-between">
      My Credentials <div>
        {#if canUpload($claimsStream)}
          {#if !$contractAddress}
            <PrimaryButton
              text="Deploy Profile"
              small
              onClick={() => navigate('/deploy')}
            />
          {/if}
        {/if}
      </div>
    </div>
  </div>
  {#if $loadingContracts}
    Loading...
  {:else}
    <table id="credential" class="w-full">
      <tr>
        <th class="text-left">Name</th>
        <th class="text-left">Type</th>
        <th class="text-left">Proof</th>
        <th class="text-left">Status</th>
        <th class="text-left">Action</th>
      </tr>
      <tbody>
        {#each data as claim}
          <tr>
            <td
              class="flex items-center px-2 my-1 cursor-pointer sm:px-4 md:px-6"
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
            <td><div class="status-tag status-complete">Complete</div></td>
            <td>
              <IconLink
                class="block w-10 h-12 mr-3 sm:w-4 sm:h-4"
                icon={DownloadIcon}
                href={claim.json}
                download={`${claim.display.display}.json`}
              />
            </td>
          </tr>
        {/each}

        {#each Object.values($claimsStream) as claim}
          {#if !claim.content && !claim.preparedContent}
            <tr>
              <td class="px-2 sm:px-4 md:px-6 text-left flex">
                <svelte:component
                  this={claim.display.icon}
                  class="w-10 h-12 mr-3 sm:w-4 sm:h-4"
                />
                <div>{claim.display.display}</div>
              </td>
              <td class="px-2 sm:px-4 md:px-6">
                {claim.display.type}
              </td>
              <td class="px-2 sm:px-4 md:px-6">
                {claim.display.proof}
              </td>
              <td><div class="status-tag status-incomplete">Incomplete</div></td
              >
              {#if claim.preparedContent}
                <td class="px-2 sm:px-4 md:px-6"> (Unsaved changes) </td>
              {:else}
                <td class="primary-action font-semibold cursor-pointer">
                  <div on:click={() => navigate(claim.display.route)}>
                    Verify
                  </div>
                </td>
              {/if}
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  {/if}
</div>
