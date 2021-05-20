<script type="ts">
  import { Claims } from './';
  import { BasePage, PrimaryButton, TextBody2 } from 'components';
  import { userData } from 'src/store';
  import { useNavigate } from 'svelte-navigator';

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
    <h1 class="text-6xl lg:text-8xl sm:text-7xl">Tezos Profiles</h1>

    <TextBody2
      value="Tezos Profiles enables you to associate your online identity with
  your Tezos account"
      class="my-8 text-center"
    />
    <div class="flex flex-col items-center">
      <p>
        <PrimaryButton
          class="my-4 mx-2.5"
          onClick={() => connect()}
          text="Connect Profile"
        />
        <PrimaryButton
          class="my-4 mx-2.5"
          onClick={() => search()}
          text="View Profile"
        />
      </p>
    </div>
  {:else}
    <Claims />
  {/if}
</BasePage>
