<script lang="ts">
  import { useParams } from 'svelte-navigator';
  import { CopyButton, ClaimIcon, ProfileImagePlaceholder } from 'components';
  import type { BasicDraft, Claim, ClaimMap } from 'src/helpers';
  import { publicProfileViewTooltip } from './publicProfileViewHelper';
  import './publicProfileView.scss';

  export let claimsMap: ClaimMap;

  // Specially treat the basic profile.
  const basicClaim: Claim | false =
    claimsMap?.basic?.content && claimsMap.basic;
  const basicDraft = basicClaim?.draft as BasicDraft;
  const otherClaims: Array<Claim> = Object.values(claimsMap).filter(
    (x) => x.type !== 'basic' && x.content
  );
  const params = useParams();

  const formatWebsite = (url: string): string => {
    if (url.startsWith('https://' || 'www.' || 'http://')) {
      return url;
    }
    return 'http://' + url;
  };

  let isCredentialSourceDropdownOpen = false;
  $: shouldDisplayOriginalImage = true;
</script>

<div
  class="self-center w-full break-all p-6 fade-in rounded-xl bg-white dropshadow-default public-profile-container"
>
  {#if basicClaim}
    {#if !basicDraft.logo || !shouldDisplayOriginalImage}
      <ProfileImagePlaceholder />
    {:else}
      <img
        src={basicDraft.logo || ''}
        class="img-self"
        alt="profile-logo"
        on:error={() => {
          shouldDisplayOriginalImage = false;
        }}
      />
    {/if}
    <div class="text-2xl font-bold body mb-2 mt-4">
      {basicDraft.alias || ''}
    </div>
  {/if}
  <div class="flex flex-row items-center">
    <div class="flex flex-row items-center cursor-pointer bubble-outline">
      <div class="address-container">
        {$params.address}
      </div>
      <CopyButton text={$params.address} color="gray" class="w-4 h-4 ml-2" />
    </div>
    {#each Object.values(otherClaims) as claim}
      <ClaimIcon {claim} tooltip={publicProfileViewTooltip(claim)} />
    {/each}
  </div>
  {#if basicClaim}
    <!-- Specially treat basicClaim -->
    <a href={formatWebsite(basicDraft.website)} target="_blank">
      <div class="my-6">{basicDraft.website || ''}</div>
    </a>
    <div class="break-normal description-section">
      {basicDraft.description || ''}
    </div>
    <div class="mt-12 mb-4">
      <hr />
    </div>
  {/if}
  <div
    class="cursor-pointer font-semibold my-4"
    on:click={() =>
      (isCredentialSourceDropdownOpen = !isCredentialSourceDropdownOpen)}
  >
    View Credential Sources
  </div>
  {#if isCredentialSourceDropdownOpen}
    {#each Object.values(claimsMap).filter((x) => !!x.content) as claim}
      <div class="flex w-full justify-between	my-2">
        <div>{claim.display.display}</div>
        <div>{claim.display.proof}</div>
      </div>
    {/each}
  {/if}
</div>
