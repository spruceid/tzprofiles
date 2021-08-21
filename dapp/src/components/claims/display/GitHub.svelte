<script lang="ts">
  import { Input, Label, GitHubIcon } from 'src/components';
  import type { GitHubDraft, Claim } from 'src/helpers';
  import { ClaimLinkInput } from 'src/components/claims';

  export let claim: Claim;
  $: display = claim.display;
  $: draft = claim.draft as GitHubDraft;
</script>

<div>
  <div class="flex justify-between items-center">
    <Label
      class="mt-4"
      fieldName="basic-github-handle"
      value="GitHub Username"
    />

    {#if draft?.handle}
      <p class="text-sm text-gray-350 mt-2">(signed-by tzprofiles.com)</p>
    {/if}
  </div>

  {#if draft?.handle && draft?.gistId}
    <div class="flex items-center">
      <Input
        prefix=""
        fluid
        name="basic-github-handle"
        value={draft.handle}
        disabled
      />
      <a href={`https://gist.github.com/${draft.handle}/${draft.gistId}`} title="View gist" target="_blank">
        <GitHubIcon class="h-6 ml-2" />
      </a>
    </div>
  {:else}
    <ClaimLinkInput {display} />
  {/if}
</div>
