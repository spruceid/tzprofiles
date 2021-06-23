<script type="ts">
  import Claims from '../Claims.svelte';
  import {
    BasePage,
    PrimaryButton,
    TextBody2,
    Select,
    Option,
  } from 'components';
  import { initWallet, network, userData, wallet } from 'src/store';
  import NetworkType from 'enums/NetworkType';
  import { onMount } from 'svelte';
  import './connect.scss';

  $: errorMessage = '';
  $: statusMessage = '';
  $: showWalletButton = true;
  let selectedNetwork: string = '';

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

  onMount(() => {
    selectedNetwork = $network;
  });
</script>

{#if errorMessage}
  <p>{errorMessage}</p>
{/if}
<BasePage class="flex-col flex-wrap items-center justify-center">
  {#if !$userData}
    <div class="splash-container">
      <div class="text-4xl lg:text-6xl sm:text-5xl font-bold">
        Tezos Profiles
      </div>

      <TextBody2
        value="Tezos Profiles enables you to associate your online identity with
  your Tezos account"
        class="my-8"
      />
      <br />
      <div>
        <label for="network">Choose a network:</label>
        <Select
          name="network"
          id="network"
          bind:value={selectedNetwork}
          onChange={setSelectedNetwork}
        >
          <Option value="mainnet" text="mainnet" selected />
          <Option value="granadanet" text="granadanet" />
          <Option value="edonet" text="edonet" />
          <Option value="florencenet" text="florencenet" />
          <Option value="custom" text="custom" />
        </Select>
        <p>
          {#if showWalletButton}
            <PrimaryButton
              class="my-4"
              onClick={() => initWallet()}
              text="Connect Wallet"
            />
          {:else}
            <button on:click={resetWallet}>Reset Tezos Wallet Connection</button
            >
          {/if}
        </p>
      </div>
    </div>
  {:else}
    <Claims />
  {/if}
</BasePage>
