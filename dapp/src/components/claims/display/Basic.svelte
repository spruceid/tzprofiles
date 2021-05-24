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
      <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
    {/if}
  </div>
  {#if draft.alias}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="basic-alias"
        value={draft.alias}
        disabled
      />
    </div>
  {:else}
    <ClaimLinkInput display={display} />
  {/if}

  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-description" value="Description" />
    {#if draft.description}
      <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
    {/if}
  </div>

  {#if draft.description}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="basic-description"
        value={draft.description}
        disabled
      />
    </div>
  {:else}
    <ClaimLinkInput display={display} />
  {/if}

  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-website" value="Website" />
    {#if draft.website}
      <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
    {/if}
  </div>

  {#if draft.website}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="basic-website"
        value={draft.website}
        disabled
      />
    </div>
  {:else}
    <ClaimLinkInput display={display} />
  {/if}
  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-logo" value="Logo" />
    {#if draft.logo}
      <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
    {/if}
  </div>

  <div class="flex items-center justify-between">
    <div
      class="flex items-center justify-center w-32 h-32 text-center border rounded-lg border-green-550 text-gray-350"
      class:opacity-60={true}
    >
      {#if draft.logo}
        <img
          name="basic-logo"
          class="object-contain"
          src={draft.logo}
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
</div>
