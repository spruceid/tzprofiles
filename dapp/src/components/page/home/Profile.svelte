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
  } from 'components';

  import {
    claimsStream,
    originate,
    userData,
    loadCoreProfile,
    loadTwitterProfile,
  } from 'src/store';
  import type { ClaimMap } from 'src/store';

  let coreAlias: string = '';
  let coreDescription: string = '';
  let coreLogo: string = '';
  let twitterHandle: string = '';

  onMount(() => {
    loadCoreProfile($claimsStream).then((res) => {
      let { alias, description, logo } = res;
      coreAlias = alias || '';
      coreDescription = description || '';
      coreLogo = logo || '';
    });

    loadTwitterProfile($claimsStream).then((res) => {
      let { handle } = res;
      twitterHandle = handle || '';
    });
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
  {#if coreAlias}
    <Input fluid name="core-alias" value={coreAlias} disabled />
  {:else}
    <LinkInput href="/core-profile" source="Core Profile Information" />
  {/if}

  <Label class="mt-4" fieldName="core-description" value="Description" />
  {#if coreDescription}
    <Input fluid name="core-description" value={coreDescription} disabled />
  {:else}
    <LinkInput href="/core-profile" source="Core Profile Information" />
  {/if}

  <Label class="mt-4" fieldName="core-logo" value="Logo" />
  <div
    class="flex items-center justify-center w-32 h-32 text-center border rounded-lg border-green-550 text-gray-350"
    class:opacity-60={true}
  >
    {#if coreLogo}
      <img
        name="core-logo"
        class="object-contain"
        src={coreLogo}
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

  <Label class="mt-4" fieldName="core-twitter-handle" value="Twitter Handle" />
  {#if twitterHandle}
    <Input
      prefix="@"
      fluid
      name="core-twitter-handle"
      value={twitterHandle}
      disabled
    />
  {:else}
    <LinkInput href="/twitter" source="Twitter Account Information" />
  {/if}

  <Spacer />

  {#if hasUrl($claimsStream)}
    <PrimaryButton
      text="Deploy Profile"
      class="mx-auto mt-4 bottom-6"
      onClick={async () => {
        await originate();
      }}
    />
  {:else}
    <PrimaryButton
      text="Deploy Profile"
      class="mx-auto mt-4 bottom-6"
      disabled
    />
  {/if}
</Card>
