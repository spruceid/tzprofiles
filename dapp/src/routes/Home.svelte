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
        <label for="network">Choose a network:</label>
        <Select
          name="network"
          id="network"
          bind:value={selectedNetwork}
          onChange={setSelectedNetwork}
        >
          <Option value="mainnet" text="mainnet" selected />
          <Option value="edonet" text="edonet" />
          <Option value="florencenet" text="florencenet" />
          <Option value="localhost" text="localhost" />
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
