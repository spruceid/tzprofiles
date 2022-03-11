<script lang="ts">
  import { Input, Label } from 'src/components';
  import { ClaimLinkInput } from 'src/components/claims';
  import type { BasicDraft, Claim } from 'src/helpers';

  export let basicClaim: Claim;
  $: display = basicClaim.display;
  $: draft = basicClaim.draft as BasicDraft;
</script>

<div>
  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-alias" value="Alias" />
    {#if draft.alias}
      <p class="text-sm text-gray-350 mt-2">(self-attested)</p>
    {/if}
  </div>
  {#if draft.alias}
    <Input fluid name="basic-alias" class="mb-3" value={draft.alias} disabled />
  {:else}
    <ClaimLinkInput {display} />
  {/if}

  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-description" value="Description" />
    {#if draft.description}
      <p class="text-sm text-gray-350 mt-2">(self-attested)</p>
    {/if}
  </div>

  {#if draft.description}
    <Input
      fluid
      name="basic-description"
      class="mb-3"
      value={draft.description}
      disabled
    />
  {:else}
    <ClaimLinkInput {display} />
  {/if}

  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-website" value="Website" />
    {#if draft.website}
      <p class="text-sm text-gray-350 mt-2">(self-attested)</p>
    {/if}
  </div>

  {#if draft.website}
    <Input
      fluid
      name="basic-website"
      class="mb-3"
      value={draft.website}
      disabled
    />
  {:else}
    <ClaimLinkInput {display} />
  {/if}
  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-logo" value="Logo" />
    {#if draft.logo}
      <p class="text-sm text-gray-350 mt-2">(self-attested)</p>
    {/if}
  </div>

  <div class="flex items-center justify-between">
    <div
      class="flex flex-col items-center justify-center w-32 h-32 text-center border rounded-lg border-gray-200 text-gray-350"
      class:opacity-60={true}
    >
      {#if draft.logo}
        <img
          name="basic-logo"
          class="object-cover object-center w-full h-full rounded-lg flex items-center justify-center"
          src={draft.logo}
          alt="Basic profile logo"
        />
      {:else}
        <p class="m-2 italic break-words select-none">
          {'Available in '}
          <a href="/basic-profile" class="underline">
            Basic profile Information
          </a>
        </p>
      {/if}
    </div>
  </div>
</div>
