<script lang="ts">
  import { onMount } from 'svelte';
  import { searchAddress } from 'src/store';
  import { CopyButton, TwitterIcon } from 'components';
  import './publicProfileView.scss';

  export let claimsMap;

  let basicDisplay;
  let twitterDisplay;

  const websiteLinkFormatter = (url: string): string => {
    if (!url.startsWith('https://')) return `https://www.${url}`;
    if (!url.includes('www')) return `https://www.${url}}`;
    return url;
  };

  onMount(() => {
    if (claimsMap.basic) basicDisplay = claimsMap.basic.draft;
    if (claimsMap.twitter) twitterDisplay = claimsMap.twitter.draft;
  });
</script>

<div
  class="self-center w-full break-all md:max-w-md lg:max-w-md p-6 fade-in rounded-xl bg-white dropshadow-default"
>
  {#if basicDisplay}<div class="text-2xl font-bold body mb-2">
      {basicDisplay.alias || ''}
    </div>
    <div class="flex flex-row items-center">
      <div class="flex flex-row items-center cursor-pointer bubble-outline">
        <div class="address-container">
          {$searchAddress}
        </div>
        <CopyButton text={$searchAddress} color="gray" class="w-4 h-4 ml-2" />
      </div>

      {#if twitterDisplay}
        <a
          href={`https://twitter.com/${twitterDisplay.handle}`}
          target="_blank"
        >
          <div class="social-icon-container">
            <TwitterIcon />
          </div>
        </a>
      {/if}
    </div>
    <a href={websiteLinkFormatter(basicDisplay.website) || ''} target="_blank">
      <div class="my-6">{basicDisplay.website || ''}</div>
    </a>
    <div>{basicDisplay.description || ''}</div>{/if}
</div>
