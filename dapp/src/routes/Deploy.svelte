<script lang="ts">
  import { BasePage, VerificationStep, PrimaryButton } from 'components';
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
  import { useNavigate } from 'svelte-navigator';
  import { onMount } from 'svelte';

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
  let agreedToConditions = false;

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

  onMount(() => {
    if (
      (redirectCheck($claimsStream) && currentContractAddress) ||
      !$userData
    ) {
      navigate('/connect');
    }
  });

  const deploy = async () => {
    await upload();
    await generateContract();
  };
</script>

<BasePage
  class="flex flex-1 flex-col flex-wrap justify-center items-center text-white 2xl:px-32 sm:px-8 px-4 overflow-hidden-x pt-18 sm:pt-22 md:pt-34"
>
  <div class="flex flex-col w-full md:max-w-144">
    <VerificationStep
      step={1}
      bind:currentStep
      title="Deploy Your Profile"
      description="Upload your credentials to Kepler, and deploy your Tezos Profile smart contract."
    >
      <div class="w-full body mt-8">
        <div class="flex items-start md:items-center">
          <input
            class="mt-1 md:mt-0 mr-2 md:mr-4 body"
            id="agreement"
            name="agreement"
            type="checkbox"
            bind:checked={agreedToConditions}
            disabled={currentStep !== 1}
          />
          <label for="agreement" class="body">
            I have
            <span class="font-bold">{'read'}</span>
            and
            <span class="font-bold">{'agree'}</span>
            with the
            <a class="primary-action" target="_blank" href="/privacy-policy">
              Privacy Policy
            </a>
            and the
            <a class="primary-action" target="_blank" href="/terms-of-service">
              Terms of Service
            </a>
            .
          </label>
        </div>

        {#if currentStep === 1}
          <div class="w-40 mt-4">
            <PrimaryButton
              text="Deploy"
              onClick={() => {
                next();
                deploy();
              }}
              disabled={!agreedToConditions}
            />
          </div>
        {/if}
      </div>
    </VerificationStep>

    <VerificationStep
      step={2}
      bind:currentStep
      title="Uploading Credentials to Kepler"
      loading={currentStep === 2 && !retry}
      error={currentStep === 2 && retry}
    >
      {#if retry && currentStep === 2}
        <div class="w-40">
          <PrimaryButton text="Retry" onClick={() => upload()} />
        </div>
      {/if}
    </VerificationStep>

    <VerificationStep
      step={3}
      bind:currentStep
      title="Deploying Your Tezos Profile"
      loading={currentStep === 3 && !retry}
      error={currentStep === 3 && retry}
    >
      {#if retry && currentStep === 3}
        <div class="w-40">
          <PrimaryButton text="Retry" onClick={() => generateContract()} />
        </div>
      {/if}
    </VerificationStep>

    <VerificationStep step={4} bind:currentStep title="Profile Deployed">
      {#if currentStep > 3}
        <div class="flex flex-col lg:flex-row">
          <PrimaryButton
            text="Return to Profile"
            onClick={() => {
              navigate('/connect');
            }}
          />
        </div>
      {/if}
    </VerificationStep>
  </div>
</BasePage>
