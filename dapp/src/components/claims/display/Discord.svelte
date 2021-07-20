<script lang="ts">
  import { Input, Label } from 'src/components';
  import type { TwitterDraft, Claim } from 'src/helpers';
  import { ClaimLinkInput } from 'src/components/claims';

  export let claim: Claim;
  $: display = claim.display;
  $: draft = claim.draft as TwitterDraft;
</script>

<div>
  <div class="flex justify-between items-center">
    <Label
      class="mt-4"
      fieldName="basic-discord-handle"
      value="Discord Handle"
    />

    <p class="text-sm text-gray-350 mt-2">(signed-by tzprofiles.com)</p>
  </div>

  {#if draft?.handle}
    <div class="flex items-center">
      <Input
        prefix="@"
        fluid
        name="basic-dicord-handle"
        value={draft.handle}
        disabled
      />
    </div>
  {:else}
    <ClaimLinkInput {display} />
  {/if}
</div>
