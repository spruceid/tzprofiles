<script lang="ts">
  import { Input, Label, TwitterIcon } from 'src/components';
  import type { TwitterDraft, Claim } from 'src/helpers';
  import { ClaimLinkInput } from 'src/components/claims';

  export let twitterClaim: Claim;
  $: display = twitterClaim.display;
  $: draft = twitterClaim.draft as TwitterDraft;
</script>

<div>
  <div class="flex justify-between items-center">
    <Label
      class="mt-4"
      fieldName="basic-twitter-handle"
      value="Twitter Handle"
    />

    {#if draft?.handle}
      <p class="text-sm text-gray-350 mt-2">(signed-by tzprofiles.com)</p>
    {/if}
  </div>

  {#if draft?.handle && draft?.tweetUrl}
    <div class="flex items-center">
      <Input
        prefix="@"
        fluid
        name="basic-twitter-handle"
        value={draft.handle}
        disabled
      />
      <a href={draft.tweetUrl} title="View tweet" target="_blank">
        <TwitterIcon class="h-6 ml-2" color="#00ACEE" />
      </a>
    </div>
  {:else}
    <ClaimLinkInput {display} />
  {/if}
</div>
