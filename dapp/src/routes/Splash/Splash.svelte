<script type="ts">
  import Claims from '../Claims.svelte';
  import { BasePage, PrimaryButton, TextBody2 } from 'components';
  import { userData } from 'src/store';
  import { useNavigate } from 'svelte-navigator';
  import './splash.scss';

  $: errorMessage = '';
  const navigate = useNavigate();

  const search = () => {
    navigate('/search');
  };

  const connect = () => {
    navigate('/connect');
  };
</script>

{#if errorMessage}
  <p>{errorMessage}</p>
{/if}
<BasePage class="flex-col flex-wrap items-center justify-center">
  {#if !$userData}
    <div class="splash-container">
      <div class="flex flex-col items-center">
        <div
          class="text-5xl lg:text-7xl sm:text-6xl font-bold text-center mb-12"
        >
          Protect your identity on Tezos
        </div>

        <div class="mb-12 text-center body1 subtitle-container">
          Tezos Profiles enables you to associate your online identity with your
          Tezos account
        </div>

        <div class="text-center">
          <PrimaryButton
            class="my-4 mx-2.5"
            onClick={() => connect()}
            text="Connect wallet"
          />
          <PrimaryButton
            class="my-4 mx-2.5"
            onClick={() => search()}
            text="Search Profiles"
            secondary
          />
        </div>
      </div>
    </div>
  {:else}
    <Claims />
  {/if}
</BasePage>
