<script lang="ts">
  import { onMount } from 'svelte';
  import {
    BasePage,
    SpinnerIcon,
    CircleCheckIcon,
    VerificationStep,
    VerificationDescription,
    Cat,
  } from 'components';

  import {
    originate,
    userData,
    networkStr,
    claimsStream,
    contractAddress,
    localBasicProfile,
    localTwitterProfile,
    saveToKepler,
    viewerInstance,
  } from 'src/store';
  import type { ClaimMap } from 'src/store';

  let currentStep: number = 1;
  const next = () => (currentStep = currentStep + 1);

  let uploading: number = 0;
  const nextUpload = () => (uploading = uploading + 1);

  const deploy = async () => {
    const basicProfileUpdate = $claimsStream;
    const basicProfileUrl = await saveToKepler($localBasicProfile);
    basicProfileUpdate.TezosControl.url = basicProfileUrl;
    claimsStream.set(basicProfileUpdate);
    nextUpload();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const twitterProfileUpdate = $claimsStream;
    const twitterProfileUrl = await saveToKepler($localTwitterProfile);
    twitterProfileUpdate.TwitterControl.url = twitterProfileUrl;
    claimsStream.set(twitterProfileUpdate);
    nextUpload();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    next();

    await originate();
    next();
    next();
  };

  let network = $networkStr === 'edonet' ? 'edo2net' : $networkStr;

  deploy();
</script>

<BasePage class="flex-wrap items-center justify-center">
  <VerificationDescription icon={Cat} title="Deploying Profile" />

  <div class="flex flex-col justify-evenly md:w-1/2">
    <VerificationStep
      step={1}
      bind:currentStep
      title="Upload Credentials to Kepler"
    >
      <div class="flex items-center">
        <span>{'Basic Profile Information'}</span>
        {#if uploading > 0}
          <CircleCheckIcon class="w-4 h-4 ml-4" color="#429383" />
        {:else}
          <SpinnerIcon class="w-4 h-4 ml-4 animate-spin" />
        {/if}
      </div>
      <div class="flex items-center">
        <span>{'Twitter Account Verification'}</span>
        {#if uploading > 1}
          <CircleCheckIcon class="w-4 h-4 ml-4" color="#429383" />
        {:else}
          <SpinnerIcon class="w-4 h-4 ml-4 animate-spin" />
        {/if}
      </div>
    </VerificationStep>

    <VerificationStep
      step={2}
      bind:currentStep
      title="Deploy Contract to Blockchain"
      loading={currentStep === 2}
    />

    <VerificationStep step={3} bind:currentStep title="Profile Deployed">
      {#if currentStep > 2}
        <p class="inline font-poppins">
          {'View on '}
          <a href={`${viewerInstance}/${network}/${$userData.account.address}`}>
            {'Tezos Profiles Viewer'}
          </a>
        </p>
      {/if}
    </VerificationStep>
  </div>
</BasePage>
