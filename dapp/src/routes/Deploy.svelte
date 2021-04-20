<script lang="ts">
  import {
    BasePage,
    VerificationStep,
    VerificationDescription,
    Cat,
    PrimaryButton,
  } from 'components';

  import {
    originate,
    userData,
    networkStr,
    claimsStream,
    localBasicProfile,
    localTwitterProfile,
    saveToKepler,
    viewerInstance,
    alert,
  } from 'src/store';

  let currentStep: number = 1;
  let retry: boolean = false;
  const next = () => (currentStep = currentStep + 1);

  const generateContract = async () => {
    retry = false;
    try {
      await originate();
      next();
      next();
    } catch (e) {
      alert.set({
        message: e.message || e,
        variant: 'error',
      });
      console.error(e);
      retry = true;
    }
  };

  const upload = async () => {
    retry = false;
    try {
      const profileStream = $claimsStream;
      const [basicProfileUrl, twitterProfileUrl] = await saveToKepler(
        $localBasicProfile,
        $localTwitterProfile
      );
      profileStream.TezosControl.url = basicProfileUrl;
      profileStream.TwitterControl.url = twitterProfileUrl;
      claimsStream.set(profileStream);
      await new Promise((resolve) => setTimeout(resolve, 500));
      next();
    } catch (e) {
      retry = true;
      throw e;
    }
  };

  const deploy = async () => {
    await upload();
    await generateContract();
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
      loading={currentStep === 1}
    >
      {#if retry && currentStep === 1}
        <div class="w-40">
          <PrimaryButton text="Retry" onClick={() => upload()} />
        </div>
      {/if}
    </VerificationStep>

    <VerificationStep
      step={2}
      bind:currentStep
      title="Deploy Contract to Blockchain"
      loading={currentStep === 2}
    >
      {#if retry && currentStep === 2}
        <div class="w-40">
          <PrimaryButton text="Retry" onClick={() => generateContract()} />
        </div>
      {/if}
    </VerificationStep>

    <VerificationStep step={3} bind:currentStep title="Profile Deployed">
      {#if currentStep > 2}
        <p class="inline font-poppins">
          {'View on '}
          <a
            href={`${viewerInstance}/view/${network}/${$userData.account.address}`}
          >
            {'Tezos Profiles Viewer'}
          </a>
        </p>
      {/if}
    </VerificationStep>
  </div>
</BasePage>
