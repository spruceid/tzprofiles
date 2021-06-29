<script lang="ts">
  import { onMount } from 'svelte';
  import { useNavigate } from 'svelte-navigator';
  import { claimsStream, loadingContracts, contractAddress } from 'src/store';
  import './availablecredentials.scss';
  import {
    IconLink,
    DownloadIcon,
    FileModal,
    ViewIcon,
    ClaimDisplay,
  } from 'components';
  import { PrimaryButton } from 'components/buttons';
  import { canUpload, makeDownloadable } from './uploadHelpers';
  import Profile from './Profile.svelte';
  import 'src/common/style/animation.scss';

  let navigate = useNavigate();

  let modalOpen = false;
  let isCredentialModalOpen = false;
  let selectedClaimToView = null;
  let data: any[] = [];

  onMount(async () => {
    try {
      console.log($claimsStream);
      if (
        !Object.values($claimsStream).every(
          (claim) => !claim.content && !claim.preparedContent
        )
      ) {
        data = await Promise.all(
          Object.values($claimsStream)
            // TODO: Distinguish between content and preparedContent in UI
            .filter((claim) => claim.content || claim.preparedContent)
            .map(async (claim) => {
              // TODO: Distinguish between content and preparedContent in UI
              let json = makeDownloadable(
                claim.content || claim.preparedContent
              );
              return { ...claim, json };
            })
        );

        console.log('Data', data);
      }
    } catch (err) {
      console.error(`Died in MyCredentials OnMount ${err.message}`);
    }
  });

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
      <div>
        {#if canUpload($claimsStream) && !$contractAddress}
          <PrimaryButton
            text="Deploy Profile"
            small
            onClick={() => openModal()}
          />
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
        {#each data as claim}
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
            <td><div class="status-tag status-complete">Complete</div></td>
            <td class="flex flex-row items-center">
              <IconLink
                class="block w-10 h-12 mr-3 sm:w-4 sm:h-4"
                icon={DownloadIcon}
                href={claim.json}
                download={`${claim.display.display}.json`}
              />
              <div
                on:click={() => {
                  isCredentialModalOpen = true;
                  selectedClaimToView = claim;
                  console.log(claim);
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
      <Profile />
    </div></FileModal
  >
{/if}

{#if isCredentialModalOpen}
  <FileModal onClose={() => (isCredentialModalOpen = false)}
    ><div class="w-full">
      <ClaimDisplay claim={selectedClaimToView} />
    </div>
  </FileModal>
{/if}
