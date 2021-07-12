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
    shouldDisplayPendingStatus,
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

  type contentType = 'content' | 'preparedContent';
  let filterType: contentType;

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
      <div
        class="text-2xl font-bold body"
        on:click={() => {
          navigate('/discord');
        }}
      >
        My Credentials
      </div>

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
      <tbody>
        {#each Object.values($claimsStream).filter((claim) => claim.content || claim.preparedContent) as claim}
          <tr>
            <td
              class="flex items-center px-2 my-1 cursor-pointer sm:px-4 md:px-6"
            >
              <svelte:component
                this={claim.display.icon}
                class="w-10 h-12 mr-3 sm:w-4 sm:h-4"
              />
              <div>{claim.display.display}</div>
            </td>
            <td class="px-2 sm:px-4 md:px-6">
              {claim.display.type}
            </td>
            <td class="px-2 sm:px-4 md:px-6">
              {claim.display.proof}
            </td>
            <td
              ><div
                class={`status-tag ${
                  shouldDisplayPendingStatus(claim)
                    ? 'status-pending'
                    : 'status-complete'
                }`}
              >
                {shouldDisplayPendingStatus(claim) ? 'Pending' : 'Complete'}
              </div></td
            >
            <td class="flex flex-row items-center">
              <IconLink
                class="block w-10 h-12 mr-3 sm:w-4 sm:h-4"
                icon={DownloadIcon}
                href={makeDownloadable(claim.content || claim.preparedContent)}
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
            </td>
          </tr>
        {/each}

        {#each Object.values($claimsStream) as claim}
          {#if !claim.content && !claim.preparedContent}
            <tr>
              <td class="px-2 sm:px-4 md:px-6 text-left flex">
                <svelte:component
                  this={claim.display.icon}
                  class="w-10 h-12 mr-3 sm:w-4 sm:h-4"
                />
                <div>{claim.display.display}</div>
              </td>
              <td class="px-2 sm:px-4 md:px-6">
                {claim.display.type}
              </td>
              <td class="px-2 sm:px-4 md:px-6">
                {claim.display.proof}
              </td>
              <td><div class="status-tag status-incomplete">Incomplete</div></td
              >
              {#if claim.preparedContent}
                <td class="px-2 sm:px-4 md:px-6"> (Unsaved changes) </td>
              {:else}
                <td>
                  <div
                    on:click={() => navigate(claim.display.route)}
                    class="primary-action cursor-pointer inline-block font-medium"
                  >
                    Verify
                  </div>
                </td>
              {/if}
            </tr>
          {/if}
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
