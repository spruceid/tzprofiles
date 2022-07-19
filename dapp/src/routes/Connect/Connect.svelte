<script type="ts">
  import Claims from '../Claims.svelte';
  import { PrimaryButton, Select, Option } from 'components';
  import { initWallet, network, userData, wallet } from 'src/store';
  import NetworkType from 'enums/NetworkType';
  import { onMount } from 'svelte';
  import { useNavigate } from 'svelte-navigator';
  import './connect.scss';

  const navigate = useNavigate();

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
    if (!$userData) {
      navigate('/');
    }
  });
</script>

{#if errorMessage}
  <p>{errorMessage}</p>
{/if}

{#if !$userData}
  <div class="w-full">
    <div class="text-2xl font-bold body mb-6 pt-4">
      Choose network and connect
    </div>
    <div
      class="flex items-center relative max-w-60 w-full mx-auto cursor-pointer"
    >
      <Select
        name="network"
        id="network"
        bind:value={selectedNetwork}
        onChange={setSelectedNetwork}
      >
        <Option value="mainnet" text="mainnet" selected />
        <Option value="ghostnet" text="ghostnet" />
        <Option value="custom" text="localhost" />
      </Select>
      <div
        class="absolute flex items-center justify-center top-0 right-0 w-10 h-full bg-transparent"
      >
        <div class="arrow down" />
      </div>
    </div>
    <div>
      {#if showWalletButton}
        <PrimaryButton
          class="mt-8 max-w-42 max-w-48 w-full"
          onClick={async () => {
            await initWallet();
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';

            document.body.style.height = '100%';
            document.body.style['overflow-y'] = 'auto';
            document.body.style['padding-right'] = '0px';

            window.scrollTo(0, parseInt(scrollY || '0') * -1);
            navigate('/connect');
          }}
          text="Connect Wallet"
        />
      {:else}
        <button on:click={resetWallet}>Reset Tezos Wallet Connection</button>
      {/if}
    </div>
  </div>
{:else}
  <Claims />
{/if}
