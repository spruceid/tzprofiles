<script lang="ts">
  import { useNavigate } from 'svelte-navigator';
  import { onMount, onDestroy } from 'svelte';
  import {
    claimsStream,
    loadingContracts,
    contractAddress,
    networkStr,
  } from 'src/store';
  import './availablecredentials.scss';
  import { FileModal, ViewIcon, ClaimDisplay } from 'components';
  import { PrimaryButton } from 'components/buttons';
  import {
    canUpload,
    makeDownloadable,
    isAllOnChain,
    selectDisplayStatus,
    sortClaimsByStatus,
    statusTextToClassMapping,
  } from './uploadHelpers';
  import Profile from './Profile.svelte';
  import DeleteCredential from './DeleteCredential.svelte';
  import MoreModal from './MoreModal/MoreModal.svelte';
  import 'src/common/style/animation.scss';

  let navigate = useNavigate();

  let currentNetwork: string;
  networkStr.subscribe((x) => {
    currentNetwork = x;
  });

  let modalOpen = false;
  let isDeleteModalOpen = false;
  let isCredentialModalOpen = false;
  let selectedClaimToView = null;

  let selectedClaimToDelete = null;

  const closeModal = () => {
    modalOpen = false;
  };

  const openModal = () => {
    modalOpen = true;
  };

  onMount(() => {
    if (canUpload($claimsStream)) {
      window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        return (e.returnValue = '');
      });
    }
  });

  onDestroy(() => {
    window.removeEventListener('beforeunload', () => {});
  });
</script>

<div class="table-container fade-in dropshadow-default mb-4">
  <div class="header-row-container">
    <div class="body flex flex-row items-center w-full justify-between">
      <div class="text-xl sm:text-2xl font-bold body">My Credentials</div>

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
                    currentNetwork ? `${currentNetwork}.` : ''
                  }tzkt.io/${$contractAddress}`
                )}
            />
          {/if}
        </div>

        {#if canUpload($claimsStream)}
          <div>
            {#if $contractAddress !== null}
              {#if !isAllOnChain($claimsStream)}
                <PrimaryButton
                  small
                  text="Upload Claims"
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
        {#each Object.values($claimsStream).sort(sortClaimsByStatus) as claim}
          <tr>
            <td class="flex flex-row items-center">
              <div class="flex items-center justify-start">
                <svelte:component
                  this={claim.display.icon}
                  class="sm:mr-3 w-4 h-4"
                />
              </div>
              <div class="hidden sm:flex w-icon-describe-desk">{claim.display.display}</div>
            </td>
            <td class="px-2 sm:px-4 md:px-6">
              {claim.display.type}
            </td>
            <td class="px-2 sm:px-4 md:px-6">
              {claim.display.proof}
            </td>
            <td
              ><div
                class={`status-tag status-${
                  statusTextToClassMapping[selectDisplayStatus(claim)]
                }`}
              >
                <div class="capitalize">
                  {selectDisplayStatus(claim)}
                </div>
              </div></td
            >
            <td class="flex flex-row items-center">
              {#if selectDisplayStatus(claim) == 'incomplete'}
                <div
                  on:click={() => navigate(claim.display.route)}
                  class="primary-action cursor-pointer inline-block font-medium"
                >
                  Verify
                </div>
              {:else}
                <div
                  on:click={() => {
                    isCredentialModalOpen = true;
                    selectedClaimToView = claim;
                  }}
                  class="cursor-pointer mr-4"
                >
                  <ViewIcon />
                </div>
                <MoreModal
                  onClickDelete={() => {
                    isDeleteModalOpen = true;
                    selectedClaimToDelete = claim;
                  }}
                  href={makeDownloadable(
                    claim.content || claim.preparedContent
                  )}
                  downloadFileName={`${claim.display.display}.json`}
                  {claim}
                />
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

{#if isDeleteModalOpen}
  <FileModal onClose={() => (isDeleteModalOpen = false)}
    ><DeleteCredential
      claim={selectedClaimToDelete}
      onClose={() => (isDeleteModalOpen = false)}
    />
  </FileModal>
{/if}
