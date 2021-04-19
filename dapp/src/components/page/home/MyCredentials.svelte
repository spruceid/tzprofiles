<script lang="ts">
  import { onMount } from 'svelte';
  import { IconLink, DownloadIcon } from 'components';
  import { claimsStream, loadingContracts } from 'src/store';

  const makeDownloadable = (obj: object): string => {
    let stringify = JSON.stringify(obj, null, 2);
    let encoded = encodeURIComponent(stringify);
    return `data:application/json;charset=utf-8,${encoded}`;
  };

  let loading: boolean = false;
  let data: any[] = [];

  onMount(async () => {
    try {
      if ($loadingContracts) {
        loading = true;
        data = [];
      } else {
        loading = false;
        if (Object.values($claimsStream).every((claim) => !claim.url)) {
          data = [];
        } else {
          data = await Promise.all(
            Object.values($claimsStream)
              .filter((claim) => claim.url)
              .map(async (claim) => {
                let { url } = claim;
                let jsonRes = await fetch(url);

                if (!jsonRes.ok || jsonRes.status !== 200) {
                  throw new Error(`Error in claims retrieval: ${jsonRes.statusText}`);
                }

                let jsonObj = await jsonRes.json();
                let json = makeDownloadable(jsonObj);
                return { ...claim, json };
              })
          );

          console.log("Data:", data);
        }
      }

    } catch (err) {
      console.error(`Died in MyCredentials OnMount ${err.message}`)
    }
    
  });
</script>

<div class="flex flex-col my-8">
  <h3 class="mb-4 text-xl">{'My Credentials'}</h3>
  {#if loading}
    <h4>{'Loading...'}</h4>
  {:else if data.length === 0}
    <h4>{'None Currently Available'}</h4>
  {:else}
    <table class="table-auto">
      <thead>
        <th>NAME</th>
        <th>TYPE</th>
        <th>PROOF</th>
      </thead>
      <tbody>
        {#each data as claim}
          <tr>
            <td
              class="flex items-center px-2 my-1 cursor-pointer sm:px-4 md:px-6"
            >
              <svelte:component
                this={claim.icon()}
                class="w-10 h-12 mr-3 sm:w-4 sm:h-4"
              />
              <p class="font-bold">{claim.display}</p>
            </td>
            <td class="px-2 sm:px-4 md:px-6">
              {claim.type}
            </td>
            <td class="px-2 sm:px-4 md:px-6">
              {claim.proof}
            </td>
            <td>
              <IconLink
                class="block w-10 h-12 mr-3 sm:w-4 sm:h-4"
                icon={DownloadIcon}
                href={claim.json}
                download={`${claim.display}.json`}
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
