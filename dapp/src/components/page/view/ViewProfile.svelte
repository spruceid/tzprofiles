<script lang="ts">
  import { Card, Cat, CopyButton } from 'components';

  import { ClaimDisplay } from 'src/components';

  import type { Writable } from 'svelte/store';
  import type { ClaimMap } from 'src/helpers';

  export let claimsMap: Writable<ClaimMap>;

  export let address: string;
  export let network: string = 'mainnet';
</script>

<Card
  class="relative self-center w-full text-center break-all md:max-w-md lg:max-w-md p-6"
>
  <h5 class="text-xl">Contract Owner</h5>
  <div
    class="flex items-center justify-center w-full mb-4 overflow-hidden break-all overflow-ellipsis"
  >
    <p class="inline">{address}</p>
    <CopyButton text={address} color="gray" class="w-4 h-4 ml-2" />
  </div>

  {#each Object.values($claimsMap) as c}
    <ClaimDisplay claim={c} />
  {/each}

  <span class="py-2 mt-8 text-white rounded bg-green-550">
    {'view at '}
    <a
      class="text-green-900 underline"
      target="_blank"
      href={`https://${
        network ? (network === 'edonet.' ? 'edo2net.' : `${network}.`) : ''
      }tzkt.io/${address}`}
    >
      {'tzkt.io'}
    </a>
  </span>
</Card>
