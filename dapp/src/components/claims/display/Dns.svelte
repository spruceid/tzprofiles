<script lang="ts">
  import { Input, Label } from 'src/components';
  import type { DnsDraft, Claim } from 'src/helpers';
  import { ClaimLinkInput } from 'src/components/claims';

  export let claim: Claim;
  $: display = claim.display;
  $: draft = claim.draft as DnsDraft;
</script>

<div>
  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-dns-handle" value="DNS Handle" />

    {#if draft?.address}
      <p class="text-sm text-gray-350 mt-2">signed-by tzprofiles.com</p>
    {/if}
  </div>

  {#if draft?.address}
    <div class="flex items-center">
      <Input fluid name="basic-dns-handle" value={draft.address} disabled />
    </div>
  {:else}
    <ClaimLinkInput {display} />
  {/if}
</div>
