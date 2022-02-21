<script type="ts">
  import Connect from '../Connect/Connect.svelte';
  import { BasePage, PrimaryButton, FileModal } from 'components';
  import { useNavigate } from 'svelte-navigator';
  import { userData } from 'src/store';
  import './splash.scss';

  let isWalletModalOpen = false;

  $: errorMessage = '';
  const navigate = useNavigate();

  const connect = () => {
    if ($userData) {
      navigate('/connect');
    }

    isWalletModalOpen = true;
  };
</script>

{#if errorMessage}
  <p>{errorMessage}</p>
{/if}
<BasePage class="flex-col flex-wrap items-center justify-center w-full">
  <div class="splash-container fade-in">
    <div class="flex flex-col items-center">
      <div class="text-4xl sm:text-5xl lg:text-7xl sm:text-6xl font-bold text-center mb-12">
        Control Your Identity on Tezos
      </div>

      <div class="mb-12 text-center body1 subtitle-container">
        Tezos Profiles enables you to associate your online identity with your
        Tezos account.
      </div>

      <div class="text-center grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full">
        <PrimaryButton
          class="w-full max-w-48 mx-auto sm:mr-0"
          onClick={() => connect()}
          text="Connect Wallet"
        />
        <PrimaryButton
          class="w-full max-w-48 mx-auto sm:ml-0"
          onClick={() => navigate('/search')}
          text="Search Profiles"
          secondary
        />
      </div>
    </div>
  </div>
</BasePage>

{#if isWalletModalOpen}
  <FileModal onClose={() => (isWalletModalOpen = false)}><Connect /></FileModal>
{/if}
