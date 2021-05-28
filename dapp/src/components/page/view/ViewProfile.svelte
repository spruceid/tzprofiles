<script lang="ts">
  import {
    Card,
    Cat,
    Input,
    LinkInput,
    Label,
    CopyButton,
    TwitterIcon,
  } from 'components';
  import { claims, searchAddress, tweetUrl } from 'src/store';
  import { onMount } from 'svelte';

  export let address: string;
  export let network: string = 'mainnet';

  let twitterHandle;
  let twitterUrl;
  let basicProfile;
  let ready: boolean = false;

  onMount(() => {
    claims.subscribe((claim) => {
      ready = false;

      if ($claims.TwitterProfile) {
        twitterHandle = claim.TwitterProfile.credentialSubject.sameAs.replace(
          'https://twitter.com/',
          ''
        );
        twitterUrl = `https://twitter.com/${twitterHandle}/status/${claim.TwitterProfile.evidence.tweetId}`;
      }

      if ($claims.BasicProfile) {
        basicProfile = claim.BasicProfile.credentialSubject;
      }

      ready = true;
    });
  });
</script>

{#if !ready}
  <div>
    <p>Loading...</p>
  </div>
{:else}
  <Card
    class="relative self-center w-full text-center break-all md:max-w-md lg:max-w-md"
  >
    <Cat
      class="absolute left-0 right-0 w-20 h-20 mx-auto text-center -top-10"
    />
    <h5 class="text-xl font-poppins">Contract Owner</h5>
    <div
      class="flex items-center justify-center w-full mb-4 overflow-hidden break-all overflow-ellipsis"
    >
      <p class="inline font-poppins">{address}</p>
      <CopyButton text={address} color="gray" class="w-4 h-4 ml-2" />
    </div>

    <div class="flex justify-between items-center">
      <Label class="mt-4" fieldName="basic-alias" value="Alias" />
      {#if basicProfile?.alias}
        <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
      {/if}
    </div>
    {#if basicProfile?.alias}
      <div class="flex items-center">
        <Input
          fluid
          class="font-bold"
          name="basic-alias"
          value={basicProfile.alias}
          disabled
        />
      </div>
    {:else}
      <LinkInput href="/basic-profile" source="Basic Profile Information" />
    {/if}

    <div class="flex justify-between items-center">
      <Label class="mt-4" fieldName="basic-description" value="Description" />
      {#if basicProfile?.description}
        <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
      {/if}
    </div>
    {#if basicProfile?.description}
      <div class="flex items-center">
        <Input
          fluid
          class="font-bold"
          name="basic-description"
          value={basicProfile.description}
          disabled
        />
      </div>
    {:else}
      <LinkInput href="/basic-profile" source="Basic Profile Information" />
    {/if}

    <div class="flex justify-between items-center">
      <Label class="mt-4" fieldName="basic-website" value="Website" />
      {#if basicProfile?.website}
        <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
      {/if}
    </div>
    {#if basicProfile?.website}
      <div class="flex items-center">
        <Input
          fluid
          class="font-bold"
          name="basic-website"
          value={basicProfile.website}
          disabled
        />
      </div>
    {:else}
      <LinkInput href="/basic-profile" source="Basic Profile Information" />
    {/if}

    <div class="flex justify-between items-center">
      <Label class="mt-4" fieldName="basic-logo" value="Logo" />
      {#if basicProfile?.logo}
        <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
      {/if}
    </div>
    <div class="flex items-center justify-between">
      <div
        class="flex items-center justify-center w-32 h-32 text-center border rounded-lg border-green-550 text-gray-350"
        class:opacity-60={true}
      >
        {#if basicProfile?.logo}
          <img
            name="basic-logo"
            class="object-contain"
            src={basicProfile.logo}
            alt="Basic profile logo"
          />
        {:else}
          <p class="m-2 italic break-words select-none">
            {'Available in '}
            <a href="/basic-profile" class="underline">
              {'Basic profile Information'}
            </a>
          </p>
        {/if}
      </div>
    </div>

    <div class="flex justify-between items-center">
      <Label
        class="mt-4"
        fieldName="basic-twitter-handle"
        value="Twitter Handle"
      />

      {#if twitterHandle}
        <p class="text-sm text-gray-350 italic mt-2">
          (signed-by tzprofiles.com)
        </p>
      {/if}
    </div>
    {#if twitterHandle}
      <div class="flex items-center">
        <Input
          prefix="@"
          fluid
          class="font-bold"
          name="basic-twitter-handle"
          value={twitterHandle}
          disabled
        />
        <a href={twitterUrl} title="View tweet" target="_blank">
          <TwitterIcon class="h-6 ml-2" color="#00ACEE" />
        </a>
      </div>
    {:else}
      <LinkInput href="/twitter" source="Twitter Account Information" />
    {/if}

    <span class="py-2 mt-8 text-white rounded bg-green-550">
      {'view at '}
      <a
        class="text-green-900 underline"
        target="_blank"
        href={`https://${
          network ? (network === 'edonet.' ? 'edo2net.' : `${network}.`) : ''
        }tzkt.io/${$searchAddress}`}
      >
        {'tzkt.io'}
      </a>
    </span>
  </Card>
{/if}
