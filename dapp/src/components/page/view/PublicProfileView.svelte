<script lang="ts">
  import { onMount } from 'svelte';
  import { searchAddress } from 'src/store';
  import { useParams } from 'svelte-navigator';
  import {
    CopyButton,
    TwitterIcon,
    ProfileImagePlaceholder,
    EthereumIcon,
  } from 'components';
  import type { ClaimMap } from 'src/helpers';
  import './publicProfileView.scss';
  import { checkValidImageUrl } from 'src/common/helpers/profileUploadHelpers';
  const params = useParams();

  export let claimsMap: ClaimMap;

  let basicDisplay;
  let twitterDisplay;
  let ethereumDisplay;

  checkValidImageUrl;

  onMount(() => {
    console.log($params.address);
    // console.log(claimsMap);
    if (claimsMap.basic) basicDisplay = claimsMap.basic.draft;
    if (claimsMap.twitter) twitterDisplay = claimsMap.twitter.draft;
    if (claimsMap.ethereum) ethereumDisplay = claimsMap.ethereum.draft;
  });
</script>

<div
  class="self-center w-full break-all md:max-w-lg lg:max-w-lg p-6 fade-in rounded-xl bg-white dropshadow-default"
>
  {#if basicDisplay}
    {#if basicDisplay.logo && checkValidImageUrl(basicDisplay.logo)}
      <img src={basicDisplay.logo || ''} class="img-self" alt="profile-image" />
    {:else}
      <ProfileImagePlaceholder />
    {/if}

    <div class="text-2xl font-bold body mb-2 mt-4">
      {basicDisplay.alias || ''}
    </div>
    <div class="flex flex-row items-center">
      <div class="flex flex-row items-center cursor-pointer bubble-outline">
        <div class="address-container">
          {$params.address}
        </div>
        <CopyButton text={$searchAddress} color="gray" class="w-4 h-4 ml-2" />
      </div>

      {#if twitterDisplay}
        <a
          href={`https://twitter.com/${twitterDisplay.handle}`}
          target="_blank"
          class="mr-2"
        >
          <div class="social-icon-container">
            <TwitterIcon />
          </div>
        </a>
      {/if}

      {#if ethereumDisplay}
        <a
          href={`https://etherscan.io/address/${ethereumDisplay.wallet}`}
          target="_blank"
          class="mr-2"
        >
          <div class="social-icon-container">
            <EthereumIcon />
          </div>
        </a>
      {/if}
    </div>
    <a href={basicDisplay.website || ''} target="_blank">
      <div class="my-6">{basicDisplay.website || ''}</div>
    </a>
    <div>{basicDisplay.description || ''}</div>
  {/if}
</div>
