<script lang="ts">
  import { useNavigate } from 'svelte-navigator';
  import {
    claimsStream,
    loadingContracts,
    contractAddress,
    networkStr,
  } from 'src/store';
  import './availablecredentials.scss';
  import {
    IconLink,
    DownloadIcon,
    FileModal,
    ViewIcon,
    ClaimDisplay,
  } from 'components';
  import { PrimaryButton } from 'components/buttons';
  import {
    canUpload,
    makeDownloadable,
    isAllOnChain,
    selectDisplayStatus,
  } from './uploadHelpers';
  import Profile from './Profile.svelte';
  import 'src/common/style/animation.scss';

  let navigate = useNavigate();

  let currentNetwork: string;
  networkStr.subscribe((x) => {
    currentNetwork = x;
  });

  let modalOpen = false;
  let isCredentialModalOpen = false;
  let selectedClaimToView = null;

  const closeModal = () => {
    modalOpen = false;
  };
  const openModal = () => {
    modalOpen = true;
  };
</script>

<div class="table-container fade-in dropshadow-default">
  <div class="header-row-container">
    <div class="body flex flex-row items-center w-full justify-between">
      <div class="text-2xl font-bold body">My Credentials</div>

      <div class="flex flex-row items-center">
        <div class="mr-4">
          {#if $contractAddress}
            <PrimaryButton
              small
              secondary={true}
              text="View on TzKT"
              onClick={() =>
                window.open(
                  `https://${
                    currentNetwork
                      ? currentNetwork === 'edonet.'
                        ? 'edo2net.'
                        : `${currentNetwork}.`
                      : ''
                  }tzkt.io/${$contractAddress}`
                )}
            />
          {:else}
            <div class="opacity-50">No contract detected</div>
          {/if}
        </div>

        {#if canUpload($claimsStream)}
          <div>
            {#if $contractAddress !== null}
              {#if !isAllOnChain($claimsStream)}
                <PrimaryButton
                  small
                  text="Add Claims to Profile"
                  onClick={async () => {
                    openModal();
                  }}
                />
              {/if}
            {:else}
              <div>
                <PrimaryButton
                  text="Deploy Profile"
                  onClick={() => navigate('/deploy')}
                  small
                />
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
  {#if $loadingContracts}
    Loading...
  {:else}
    <table id="credential" class="w-full">
      <tr>
        <th class="text-left">Name</th>
        <th class="text-left">Type</th>
        <th class="text-left">Proof</th>
        <th class="text-left">Status</th>
        <th class="text-left">Action</th>
      </tr>
      <tbody class="table-content-continer">
        {#each Object.values($claimsStream) as claim}
          <tr>
            <td class="flex flex-row items-center">
              <div class="icon-container">
                <svelte:component
                  this={claim.display.icon}
                  class="w-10 h-12 mr-3 sm:w-4 sm:h-4"
                />
              </div>
              <div>{claim.display.display}</div>
            </td>
            <td class="px-2 sm:px-4 md:px-6">
              {claim.display.type}
            </td>
            <td class="px-2 sm:px-4 md:px-6">
              {claim.display.proof}
            </td>
            <td
              ><div class={`status-tag status-${selectDisplayStatus(claim)}`}>
                <div class="capitalize">
                  {selectDisplayStatus(claim)}
                </div>
              </div>
            </td>
            <td class="flex flex-row items-center">
              {#if selectDisplayStatus(claim) == 'incomplete'}
                <div
                  on:click={() => navigate(claim.display.route)}
                  class="primary-action cursor-pointer inline-block font-medium"
                >
                  Verify
                </div>
              {:else}
                <IconLink
                  class="block w-10 h-12 mr-4 sm:w-4 sm:h-4"
                  icon={DownloadIcon}
                  href={makeDownloadable(
                    claim.content || claim.preparedContent
                  )}
                  download={`${claim.display.display}.json`}
                />
                <div
                  on:click={() => {
                    isCredentialModalOpen = true;
                    selectedClaimToView = claim;
                  }}
                  class="cursor-pointer"
                >
                  <ViewIcon />
                </div>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

{#if modalOpen}
  <FileModal onClose={() => closeModal()}
    ><div class="flex flex-column items-center">
      <Profile onClose={() => closeModal()} />
    </div>
  </FileModal>
{/if}

{#if isCredentialModalOpen}
  <FileModal onClose={() => (isCredentialModalOpen = false)}
    ><div class="w-full">
      <ClaimDisplay claim={selectedClaimToView} />
    </div>
  </FileModal>
{/if}
