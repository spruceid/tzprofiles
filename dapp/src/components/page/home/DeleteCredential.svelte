<script lang="ts">
  import { LoadingSpinner } from 'components';
  import { PrimaryButton } from 'components/buttons';
  import type { Claim } from 'src/helpers/claims';
  import { newClaim } from 'src/helpers/claims';
  import { alert, claimsStream, removeClaims } from 'src/store';
  import { selectDisplayStatus } from './uploadHelpers';

  export let claim: Claim;
  export let onClose: () => void;

  let isDeleting = false;

  const deleteSingleCredential = async (claim: Claim) => {
    try {
      if (selectDisplayStatus(claim) === 'complete') {
        await removeClaims([claim]);
      }

      const nextClaimStream = $claimsStream;

      for (const [key, value] of Object.entries(nextClaimStream)) {
        if (value.type === claim.type) {
          nextClaimStream[key] = newClaim(claim.type);
        }
      }

      claimsStream.set(nextClaimStream);

      alert.set({
        message: 'Successfully removed credential',
        variant: 'success',
      });
    } catch (error) {
      throw new Error(error.description);
    }
  };
</script>

<div class="w-full">
  <div class="text-2xl font-bold body mb-2">Delete Credential</div>
  <div class="body mb-6">- {claim.display.display}</div>
  <div class="body mb-6">This action cannot be reversed</div>

  {#if isDeleting}
    <div class="w-full flex flex-col items-center">
      <LoadingSpinner class="rotating my-6 w-18 h-18 flex items-center justify-center" />
      Please be patient
    </div>
  {/if}

  {#if !isDeleting}
    <PrimaryButton
      small
      text={'Delete'}
      onClick={async () => {
        try {
          isDeleting = true;
          await deleteSingleCredential(claim);
        } catch (error) {
          console.log(error);
          alert.set({
            message: error,
            variant: 'error',
          });
        } finally {
          isDeleting = false;
          onClose();
        }
      }}
    />
  {/if}
</div>
