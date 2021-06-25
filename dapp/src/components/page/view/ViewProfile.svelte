<script lang="ts">
  import { Card, CopyButton } from 'components';
  import { ClaimDisplay } from 'src/components';

  import type { Writable } from 'svelte/store';
  import type { ClaimMap } from 'src/helpers';

  export let claimsMap: Writable<ClaimMap>;
  export let address: string;
  export let network: string = 'mainnet';
</script>

<Card
  class="relative self-center w-full break-all md:max-w-md lg:max-w-md p-6 dropshadow-default fade-in"
>
  <h5 class="text-xl text-left mb-2">Contract Owner</h5>
  <div class="w-full mb-4 overflow-hidden break-all overflow-ellipsis">
    <p class="inline">{address}</p>
    <CopyButton text={address} color="gray" class="w-4 h-4 ml-2" />
  </div>

  {#each Object.values($claimsMap) as c}
    <ClaimDisplay claim={c} />
  {/each}

  <a
    class="text-green-900 my-4 w-full"
    target="_blank"
    href={`https://${
      network ? (network === 'edonet.' ? 'edo2net.' : `${network}.`) : ''
    }tzkt.io/${address}`}
  >
    <div class="button-container text-center">View on tzkt.io</div>
  </a>
</Card>
