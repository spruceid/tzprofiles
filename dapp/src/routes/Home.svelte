<script type="ts">
  import { Claims } from 'routes';
  import {
    BasePage,
    PrimaryButton,
    TextBody2,
    Select,
    Option,
  } from 'components';
  import { initWallet, network, userData, wallet } from 'src/store';
  import NetworkType from 'enums/NetworkType';

  $: errorMessage = '';
  $: statusMessage = '';
  $: showWalletButton = true;
  $: selectedNetwork = '';

  const resetWallet = () => {
    statusMessage = '';
    wallet.set(null);
    showWalletButton = true;
  };

  const setSelectedNetwork = () => {
    if (Object.values(NetworkType).includes(selectedNetwork as NetworkType)) {
      network.set(selectedNetwork as NetworkType);
    }
  };
</script>

<svelte:head>
  <title>tzprofiles</title>
</svelte:head>

{#if errorMessage}
  <p>{errorMessage}</p>
{/if}
<BasePage class="items-center justify-center flex-wrap flex-col">
  {#if !$userData}
    <h1 class="lg:text-8xl sm:text-7xl text-6xl">Tezos Public Profiles</h1>

    <TextBody2
      value="Tezos Public Profiles enables you to associate your online identity with
  your Tezos account"
      class="text-center my-8"
    />
    <div class="flex flex-col items-center">
      <p>
        <label for="network">Choose a network:</label>
        <Select
          name="network"
          id="network"
          bind:value={selectedNetwork}
          onChange={setSelectedNetwork}
        >
          <Option value="mainnet" text="mainnet" selected />
          <Option value="delphinet" text="delphinet" />
          <Option value="edonet" text="edonet" />
          <Option value="custom" text="custom" />
        </Select>
      </p>
      <p>
        {#if showWalletButton}
          <PrimaryButton
            class="my-4"
            onClick={() => initWallet()}
            text="Connect Wallet"
          />
        {:else}
          <button on:click={resetWallet}>Reset Tezos Wallet Connection</button>
        {/if}
      </p>
    </div>
  {:else}
    <Claims />
  {/if}
</BasePage>
