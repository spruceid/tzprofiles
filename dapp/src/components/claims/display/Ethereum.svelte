<script lang="ts">
  import { Input, Label, EthereumIcon } from 'src/components';
  import { ClaimLinkInput } from 'src/components/claims';
  import type { EthereumDraft, Claim } from 'src/helpers';

  export let ethereumClaim: Claim;
  $: display = ethereumClaim.display;
  $: draft = ethereumClaim.draft as EthereumDraft;
</script>

<div>
  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="ethereum-wallet" value="Ethereum Wallet" />
    {#if draft.wallet}
      <p class="text-sm text-gray-350 mt-2">(signed by Ethereum wallet)</p>
    {/if}
  </div>
  {#if draft.address}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="ethereum-address"
        value={draft.address}
        disabled
      />
      <a
        href={`https://www.etherscan.com/address/${draft.address}`}
        title="View tweet"
        target="_blank"
      >
        <EthereumIcon class="h-6 ml-2" color="black" />
      </a>
    </div>
  {:else}
    <ClaimLinkInput {display} />
  {/if}
</div>
