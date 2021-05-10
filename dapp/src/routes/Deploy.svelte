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
    Claim,
    profileUrl,
  } from 'src/store';

  import type { ClaimMap } from 'src/store';
  import ProfileDisplay from 'enums/ProfileDisplay';

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

  const signedClaims = (cMap: ClaimMap): Array<Claim> => {
    let keys = Object.keys(cMap);
    let res: Array<Claim> = [];
    for (let i = 0, n = keys.length; i < n; i++) {
      let claim = cMap[keys[i]];
      if (claim.url) {
        res.push(claim);
      }
    }

    return res;
  };

  const vcsToUpload = (profiles: Array<Claim>): Array<any> => {
    let vcs: Array<any> = [];

    profiles.forEach((profile) => {
      switch (profile.display) {
        case ProfileDisplay.BASIC: {
          vcs.push($localBasicProfile);
          break;
        }
        case ProfileDisplay.TWITTER: {
          vcs.push($localTwitterProfile);
          break;
        }
      }
    });
    return vcs;
  };

  const upload = async () => {
    retry = false;
    try {
      const profileStream = $claimsStream;
      const filledProfiles = signedClaims(profileStream);
      const urls = await saveToKepler(...vcsToUpload(filledProfiles));
      filledProfiles.reverse().forEach((profile) => {
        switch (profile.display) {
          case ProfileDisplay.BASIC: {
            profileStream.TezosControl.url = urls.pop();
            break;
          }
          case ProfileDisplay.TWITTER: {
            profileStream.TwitterControl.url = urls.pop();
            break;
          }
        }
      });
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
      loading={currentStep === 1 && !retry}
      error={currentStep === 1 && retry}
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
      loading={currentStep === 2 && !retry}
      error={currentStep === 2 && retry}
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
            href={`${viewerInstance}/view/${networkStr}/${$userData.account.address}`}
          >
            {'Tezos Profiles Viewer'}
          </a>
        </p>
      {/if}
    </VerificationStep>
  </div>
</BasePage>
