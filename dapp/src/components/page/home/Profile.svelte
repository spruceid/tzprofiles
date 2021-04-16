<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Card,
    Cat,
    Input,
    LinkInput,
    Label,
    PrimaryButton,
    Spacer,
    CopyButton,
    TextBody1,
    CircleCheckIcon,
  } from 'components';

  import {
    claimsStream,
    originate,
    userData,
    loadCoreProfile,
    loadTwitterProfile,
    coreAlias,
    coreDescription,
    coreWebsite,
    coreLogo,
    twitterHandle,
    contractAddress,
  } from 'src/store';
  import type { ClaimMap } from 'src/store';

  onMount(() => {
    loadCoreProfile($claimsStream);
    loadTwitterProfile($claimsStream);
  });

  const hasUrl = (cMap: ClaimMap): boolean => {
    let keys = Object.keys(cMap);
    for (let i = 0, n = keys.length; i < n; i++) {
      let claim = cMap[keys[i]];
      if (!claim.url) {
        return false;
      }
    }

    return true;
  };

  let agreement: boolean = false;

  const toggle = () => {
    agreement = !agreement;
  };

  const deploy = async () => {
    await originate();
  };
</script>

<Card
  class="relative self-center w-full text-center break-all md:max-w-md lg:max-w-md"
>
  <Cat class="absolute left-0 right-0 w-20 h-20 mx-auto text-center -top-10" />
  <h5 class="text-xl font-poppins">Connected As:</h5>
  <div
    class="flex items-center justify-center w-full mb-4 overflow-hidden break-all overflow-ellipsis"
  >
    <p class="inline font-poppins">{$userData.account.address}</p>
    <CopyButton
      text={$userData.account.address}
      color="gray"
      class="w-4 h-4 ml-2"
    />
  </div>

  <Label class="mt-4" fieldName="core-alias" value="Alias" />
  {#if $coreAlias}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="core-alias"
        value={$coreAlias}
        disabled
      />
      <CircleCheckIcon class="mx-2 w-7 h-7" color="#429383" />
    </div>
  {:else}
    <LinkInput href="/core-profile" source="Core Profile Information" />
  {/if}

  <Label class="mt-4" fieldName="core-description" value="Description" />
  {#if $coreDescription}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="core-description"
        value={$coreDescription}
        disabled
      />
      <CircleCheckIcon class="mx-2 w-7 h-7" color="#429383" />
    </div>
  {:else}
    <LinkInput href="/core-profile" source="Core Profile Information" />
  {/if}

  <Label class="mt-4" fieldName="core-website" value="Website" />
  {#if $coreWebsite}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="core-website"
        value={$coreWebsite}
        disabled
      />
      <CircleCheckIcon class="mx-2 w-7 h-7" color="#429383" />
    </div>
  {:else}
    <LinkInput href="/core-profile" source="Core Profile Information" />
  {/if}

  <Label class="mt-4" fieldName="core-logo" value="Logo" />
  <div class="flex items-center justify-between">
    <div
      class="flex items-center justify-center w-32 h-32 text-center border rounded-lg border-green-550 text-gray-350"
      class:opacity-60={true}
    >
      {#if $coreLogo}
        <img
          name="core-logo"
          class="object-contain"
          src={$coreLogo}
          alt="Core profile logo"
        />
      {:else}
        <p class="m-2 italic break-words select-none">
          {'Available in '}
          <a href="/core-profile" class="underline">
            {'Core Profile Information'}
          </a>
        </p>
      {/if}
    </div>
    {#if $coreLogo}
      <CircleCheckIcon class="mx-2 w-7 h-7" color="#429383" />
    {/if}
  </div>

  <Label class="mt-4" fieldName="core-twitter-handle" value="Twitter Handle" />
  {#if $twitterHandle}
    <div class="flex items-center">
      <Input
        prefix="@"
        fluid
        class="font-bold"
        name="core-twitter-handle"
        value={$twitterHandle}
        disabled
      />
      <CircleCheckIcon class="mx-2 w-7 h-7" color="#429383" />
    </div>
  {:else}
    <LinkInput href="/twitter" source="Twitter Account Information" />
  {/if}

  <Spacer class="min-h-8" />

  <div class="flex items-center w-full text-gray-650">
    <input
      id="agreement"
      on:change={toggle}
      type="checkbox"
      bind:value={agreement}
    />
    <label for="agreement" class="flex-grow ml-4 text-xs text-left md:text-sm">
      {'I have '}
      <span class="font-bold">{'read'}</span>
      {' and '}
      <span class="font-bold">{'agree'}</span>
      {' with the '}
      <a class="underline text-blue-550" target="_blank" href="/privacy-policy">
        {'Privacy Policy'}
      </a>
      {' and the '}
      <a
        class="underline text-blue-550"
        target="_blank"
        href="/terms-of-service"
      >
        {'Terms of Service'}
      </a>
      {'.'}
    </label>
  </div>

  {#if hasUrl($claimsStream)}
    {#if $contractAddress !== null}
      <!-- TODO: Stylize -->
      <span class="">
        {'Profile Deployed at '}
        <a href={`https://tzkt.io/${$contractAddress}`}>{'tzkt.io'}</a>
      </span>
    {:else}
      <PrimaryButton
        text="Deploy Profile"
        class="mx-auto mt-4 bottom-6"
        disabled={agreement}
        onClick={deploy}
      />
    {/if}
  {:else}
    <PrimaryButton
      text="Deploy Profile"
      class="bottom-6 mx-auto"
      onClick={async () => {
        await originate();
      }}
    />
  {/if}
</Card>
