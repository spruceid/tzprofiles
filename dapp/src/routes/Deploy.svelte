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
    contractAddress,
    saveToKepler,
    alert,
  } from 'src/store';

  import type { ClaimMap } from 'src/helpers';
  import { contentToDraft } from 'src/helpers';

  import { Link } from 'svelte-navigator';

  import { useNavigate } from 'svelte-navigator';
  let navigate = useNavigate();

  let currentNetwork: string;
  let currentContractAddress: string;

  contractAddress.subscribe((x) => {
    currentContractAddress = x;
  });

  networkStr.subscribe((x) => {
    currentNetwork = x;
  });

  let currentStep: number = 1;
  let retry: boolean = false;

  const redirectCheck = (cMap: ClaimMap): boolean => {
    let keys = Object.keys(cMap);
    for (let i = 0, n = keys.length; i < n; i++) {
      let claim = cMap[keys[i]];
      if (claim.onChain) {
        return true;
      }
    }
    return false;
  };

  const next = () => (currentStep = currentStep + 1);

  const generateContract = async () => {
    retry = false;
    try {
      await originate();
      const nextClaimStream = $claimsStream;
      Object.values(nextClaimStream).forEach((claim) => {
        if (claim.preparedContent) {
          claim.content = claim.preparedContent;
          claim.preparedContent = false;
          claim.draft = contentToDraft(claim.type, claim.content);

          nextClaimStream[claim.type] = claim;
          claim.onChain = true;
          nextClaimStream[claim.type] = claim;
        }
      });

      claimsStream.set(nextClaimStream);
      next();
      next();
    } catch (e) {
      alert.set({
        message: e.message || JSON.stringify(e),
        variant: 'error',
      });
      console.error(e);
      retry = true;
    }
  };

  const upload = async () => {
    retry = false;
    try {
      const nextClaimStream = $claimsStream;
      const newClaims = Object.values(nextClaimStream).filter((claim) => {
        return !!claim.preparedContent;
      });
      const urls = await saveToKepler(
        ...newClaims.map((claim) => claim.preparedContent)
      );

      newClaims.reverse().forEach((profile) => {
        let next = nextClaimStream[profile.type];
        next.irl = urls.pop();
      });

      claimsStream.set(nextClaimStream);
      await new Promise((resolve) => setTimeout(resolve, 500));
      next();
    } catch (e) {
      retry = true;
      throw e;
    }
  };

  const deploy = async () => {
    let rd =
      (redirectCheck($claimsStream) && currentContractAddress) || !$userData;
    if (rd) {
      return navigate('/connect');
    }
    await upload();
    await generateContract();
  };

  deploy();
</script>

<BasePage
  class="flex flex-grow text-white 2xl:px-32 px-8 overflow-hidden-x flex-wrap justify-center"
>
  <div class="flex flex-col md:w-1/2">
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
        <div>
          <Link to="/connect">Return to Profile</Link>
        </div>
      {/if}
    </VerificationStep>
  </div>
</BasePage>
