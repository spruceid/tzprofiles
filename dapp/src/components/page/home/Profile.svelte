<script lang="ts">
  import { Card, PrimaryButton, LoadingSpinner } from 'components';
  import {
    alert,
    claimsStream,
    networkStr,
    contractAddress,
    addToKepler,
    addClaims,
    fetchOrbitId,
  } from 'src/store';
  import {
    canUpload,
    getCurrentOrbit,
    isAllOnChain,
    shouldDisplayPendingStatus,
  } from './uploadHelpers';
  import { contentToDraft } from 'src/helpers';

  export let onClose: () => void;

  let currentNetwork: string;

  networkStr.subscribe((x) => {
    currentNetwork = x;
  });

  $: isAddingClaims = false;

  const uploadNewClaim = async () => {
    isAddingClaims = true;
    try {
      const nextClaimStream = $claimsStream;
      const newClaims = Object.values(nextClaimStream).filter((claim) => {
        return !!claim.preparedContent;
      });

      let orbit;
      orbit = getCurrentOrbit(nextClaimStream);
      if (!orbit) {
        orbit = await fetchOrbitId();
      }

      const urls = await addToKepler(
        orbit,
        ...newClaims.map((claim) => claim.preparedContent)
      );

      for (let i = newClaims.length, x = 0; i > x; i--) {
        let profile = newClaims[i - 1];
        let next = nextClaimStream[profile.type];

        next.irl = urls.pop();
        // Is a string because findNewClaims checked.
        next.content = profile.preparedContent;
        next.preparedContent = false;
        next.draft = contentToDraft(next.type, next.content);
        next.onChain = true;

        nextClaimStream[profile.type] = next;
      }

      // TODO: FIx here
      await addClaims(newClaims);
      claimsStream.set(nextClaimStream);

      onClose();
    } catch (e) {
      alert.set({
        message: `Error in add claim ${e?.message || e}`,
        variant: 'error',
      });
    } finally {
      isAddingClaims = false;
    }
  };

  let agreement: boolean = false;

  const toggle = () => {
    agreement = !agreement;
  };
</script>

<Card
  class="relative self-center w-full text-center break-all md:max-w-md lg:max-w-md"
>
  <div class="mb-4 text-2xl text-left font-bold body">
    Adding the following claims
  </div>

  <div class="mb-8">
    {#each Object.values($claimsStream) as claim}
      {#if shouldDisplayPendingStatus(claim)}
        <div class="w-fulll text-left">
          - {claim.display.display}
        </div>
      {/if}
    {/each}
  </div>

  {#if $contractAddress === null}
    <div class="flex items-center w-full text-gray-650 mt-8">
      <input id="agreement" on:change={toggle} type="checkbox" />
      <label
        for="agreement"
        class="flex-grow ml-4 text-xs text-left md:text-sm"
      >
        {'I have '}
        <span class="font-bold">{'read'}</span>
        {' and '}
        <span class="font-bold">{'agree'}</span>
        {' with the '}
        <a class="primary-action" target="_blank" href="/privacy-policy">
          {'Privacy Policy'}
        </a>
        {' and the '}
        <br />
        <a class="primary-actio" target="_blank" href="/terms-of-service">
          {'Terms of Service'}
        </a>
        {'.'}
      </label>
    </div>
  {/if}

  {#if canUpload($claimsStream)}
    {#if $contractAddress !== null}
      {#if !isAllOnChain($claimsStream)}
        {#if isAddingClaims}
          <div class="w-full flex flex-col items-center">
            <LoadingSpinner class="rotating my-6 w-18 h-18 flex items-center justify-center" />
            Please be patient
          </div>
        {:else}
          <PrimaryButton
            text="Add Claims to Profile"
            class="mx-auto mt-4 bottom-6 w-full"
            onClick={async () => {
              await uploadNewClaim();
            }}
          />
        {/if}
      {/if}
    {:else}
      <PrimaryButton
        text="Add Claims to Profile"
        class="mx-auto mt-4 bottom-6"
        disabled={!canUpload($claimsStream)}
        onClick={async () => {
          await uploadNewClaim();
        }}
      />
    {/if}
  {/if}
</Card>
