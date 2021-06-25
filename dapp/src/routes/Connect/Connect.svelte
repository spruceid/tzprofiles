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
  import { useNavigate } from 'svelte-navigator';

  const navigate = useNavigate();

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

{#if !$userData}
  <div class="w-full">
    <div class="text-2xl font-bold body mb-6">Choose network and connect</div>
    <Select
      name="network"
      id="network"
      bind:value={selectedNetwork}
      onChange={setSelectedNetwork}
    >
      <Option value="mainnet" text="mainnet" selected />
      <Option value="edonet" text="edonet" />
      <Option value="florencenet" text="florencenet" />
      <Option value="custom" text="localhost" />
    </Select>
    <p>
      {#if showWalletButton}
        <PrimaryButton
          class="my-4"
          onClick={async () => {
            await initWallet();
            navigate('/connect');
          }}
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
