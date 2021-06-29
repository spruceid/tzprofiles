<script lang="ts">
  import { IconLink, DownloadIcon } from 'components';
  import { claimsStream, loadingContracts } from 'src/store';

  type contentType = 'content' | 'preparedContent';

  export let heading: string;
  export let filterType: contentType;

  const makeDownloadable = (obj: any): string => {
    let stringify = JSON.stringify(obj, null, 2);
    let encoded = encodeURIComponent(stringify);
    return `data:application/json;charset=utf-8,${encoded}`;
  };
</script>

<div class="flex flex-col my-8">
  <h3 class="mb-4 text-xl">{heading}</h3>
  {#if $loadingContracts}
    <h4>{'Loading...'}</h4>
  {:else if Object.values($claimsStream).filter((claim) => claim[filterType]).length === 0}
    <h4>{'None Currently Available'}</h4>
  {:else}
    <table class="table-auto">
      <thead>
        <th>NAME</th>
        <th>TYPE</th>
        <th>PROOF</th>
      </thead>
      <tbody>
        {#each Object.values($claimsStream).filter((claim) => claim[filterType]) as claim}
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
            <td>
              <IconLink
                class="block w-10 h-12 mr-3 sm:w-4 sm:h-4"
                icon={DownloadIcon}
                href={makeDownloadable(claim[filterType])}
                download={`${claim.display.display}.json`}
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
