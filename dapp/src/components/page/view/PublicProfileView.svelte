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

  export let claimsMap: ClaimMap;

  const params = useParams();

  let basicDisplay;
  let twitterDisplay;
  let ethereumDisplay;

  let shouldDisplayOriginalImage = true;
  let isCredentialSourceDropdownOpen = false;

  onMount(() => {
    console.log(claimsMap);
    basicDisplay = claimsMap.basic.draft;
    twitterDisplay = claimsMap.twitter.draft;
    if (claimsMap.ethereum && claimsMap.ethereum.draft.address)
      ethereumDisplay = claimsMap.ethereum.draft;
  });
</script>

<div
  class="self-center w-full break-all md:max-w-lg lg:max-w-lg p-6 fade-in rounded-xl bg-white dropshadow-default"
>
  {#if basicDisplay}
    {#if basicDisplay.logo && shouldDisplayOriginalImage}
      <img
        src={basicDisplay.logo || ''}
        class="img-self"
        alt="profile-image"
        on:error={() => {
          shouldDisplayOriginalImage = false;
        }}
      />
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

      {#if claimsMap.twitter.content}
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
          href={`https://etherscan.io/address/${ethereumDisplay.address}`}
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
    <div class="break-normal description-section">
      {basicDisplay.description || ''}
    </div>
    <div class="mt-12 mb-4">
      <hr />
    </div>
    <div
      class="cursor-pointer font-semibold mb-4"
      on:click={() =>
        (isCredentialSourceDropdownOpen = !isCredentialSourceDropdownOpen)}
    >
      View Credential Sources
    </div>

    {#if isCredentialSourceDropdownOpen}
      {#if claimsMap.basic.content}
        <div class="flex w-full justify-between	my-2">
          <div>Basic Profile Information</div>
          <div>Self-attested</div>
        </div>
      {/if}

      {#if claimsMap.twitter.content}
        <div class="flex w-full justify-between	my-2">
          <div>Twitter Profile</div>
          <div>Signed by tzprofiles.com</div>
        </div>
      {/if}

      {#if claimsMap.ethereum.content}
        <div class="flex w-full justify-between	my-2">
          <div>Ethereum Address</div>
          <div>Signed by Ethereum Address</div>
        </div>
      {/if}
    {/if}
  {/if}
</div>
