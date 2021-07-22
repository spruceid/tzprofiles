<script lang="ts">
  import { deleteSingleCredential } from './uploadHelpers';
  import { PrimaryButton } from 'components/buttons';
  export let claim;

  let isDeleting = false;
</script>

<div class="w-full">
  <div class="text-2xl font-bold body mb-2">Delete Credential</div>
  <div class="body mb-6">This action cannot be reversed</div>
  <PrimaryButton
    small
    text={isDeleting ? 'Deleting ...' : 'Delete'}
    disabled={isDeleting}
    onClick={async () => {
      isDeleting = true;
      await deleteSingleCredential(claim);
      isDeleting = false;
    }}
  />
</div>
