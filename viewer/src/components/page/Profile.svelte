<script lang="ts">
  import {
    Card,
    Cat,
    Input,
    LinkInput,
    Label,
    CopyButton,
    CircleCheckIcon,
  } from 'components';
  import { claims, contract } from 'src/store';

  export let address: string;
  export let network: string = 'mainnet';

  let twitterHandle;
  let basicProfile;

  claims.subscribe((claim) => {
    twitterHandle = claim.TwitterProfile.credentialSubject.sameAs.replace(
      'https://twitter.com/',
      ''
    );
    basicProfile = claim.BasicProfile.credentialSubject;
  });
</script>

<Card
  class="relative self-center w-full text-center break-all md:max-w-md lg:max-w-md"
>
  <Cat class="absolute left-0 right-0 w-20 h-20 mx-auto text-center -top-10" />
  <h5 class="text-xl font-poppins">Contract Owner</h5>
  <div
    class="flex items-center justify-center w-full mb-4 overflow-hidden break-all overflow-ellipsis"
  >
    <p class="inline font-poppins">{address}</p>
    <CopyButton text={address} color="gray" class="w-4 h-4 ml-2" />
  </div>

  <Label class="mt-4" fieldName="basic-alias" value="Alias" />
  {#if basicProfile.alias}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="basic-alias"
        value={basicProfile.alias}
        disabled
      />
      <CircleCheckIcon class="mx-2 w-7 h-7" color="#429383" />
    </div>
  {:else}
    <LinkInput href="/basic-profile" source="Basic Profile Information" />
  {/if}

  <Label class="mt-4" fieldName="basic-description" value="Description" />
  {#if basicProfile.description}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="basic-description"
        value={basicProfile.description}
        disabled
      />
      <CircleCheckIcon class="mx-2 w-7 h-7" color="#429383" />
    </div>
  {:else}
    <LinkInput href="/basic-profile" source="Basic Profile Information" />
  {/if}

  <Label class="mt-4" fieldName="basic-website" value="Website" />
  {#if basicProfile.website}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="basic-website"
        value={basicProfile.website}
        disabled
      />
      <CircleCheckIcon class="mx-2 w-7 h-7" color="#429383" />
    </div>
  {:else}
    <LinkInput href="/basic-profile" source="Basic Profile Information" />
  {/if}

  <Label class="mt-4" fieldName="basic-logo" value="Logo" />
  <div class="flex items-center justify-between">
    <div
      class="flex items-center justify-center w-32 h-32 text-center border rounded-lg border-green-550 text-gray-350"
      class:opacity-60={true}
    >
      {#if basicProfile.logo}
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
    {#if basicProfile.logo}
      <CircleCheckIcon class="mx-2 w-7 h-7" color="#429383" />
    {/if}
  </div>

  <Label class="mt-4" fieldName="basic-twitter-handle" value="Twitter Handle" />
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
      <CircleCheckIcon class="mx-2 w-7 h-7" color="#429383" />
    </div>
  {:else}
    <LinkInput href="/twitter" source="Twitter Account Information" />
  {/if}

  <span class="py-2 mt-8 text-white rounded bg-green-550">
    {'view at '}
    <a
      class="text-green-900 underline"
      target="_blank"
      href={`https://${network}.tzkt.io/${$contract}`}
    >
      {'tzkt.io'}
    </a>
  </span>
</Card>
