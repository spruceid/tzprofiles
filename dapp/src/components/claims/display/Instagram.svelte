<script lang="ts">
  import { Input, Label, InstagramIcon } from 'src/components';
  import type { InstagramDraft, Claim } from 'src/helpers';
  import { ClaimLinkInput } from 'src/components/claims';

  export let instagramClaim: Claim;
  $: display = instagramClaim.display;
  $: draft = instagramClaim.draft as InstagramDraft;
</script>

<div>
  <div class="flex justify-between items-center">
    <Label
      class="mt-4"
      fieldName="basic-instagram-handle"
      value="Instagram Handle"
    />

    {#if draft?.handle}
      <p class="text-sm text-gray-350 italic mt-2">
        (signed-by tzprofiles.com)
      </p>
    {/if}
  </div>

  {#if draft?.handle && draft?.postUrl}
    <div class="flex items-center">
      <Input
        prefix="@"
        fluid
        class="font-bold"
        name="basic-instagram-handle"
        value={draft.handle}
        disabled
      />
      <a href={draft.postUrl} title="View tweet" target="_blank">
        <InstagramIcon class="h-6 ml-2" color="#00ACEE" />
      </a>
    </div>
  {:else}
    <ClaimLinkInput {display} />
  {/if}
</div>
