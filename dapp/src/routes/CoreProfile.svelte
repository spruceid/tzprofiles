<script lang="ts">
  import {
    BasePage,
    VerificationDescription,
    VerificationStep,
    Input,
    Label,
    PrimaryButton,
  } from 'components';
  import {
    claimsStream,
    createJsonBlobUrl,
    userData,
    wallet,
    networkStr,
    DIDKit,
  } from 'src/store';
  import type { ClaimMap } from 'src/store';
  import { signCoreProfile } from 'src/core_profile';

  import { useNavigate } from 'svelte-navigator';
  let navigate = useNavigate();

  const verification: ClaimMap = $claimsStream;

  let lock: boolean = false;
  let alias: string = '';
  let description: string = '';
  let logo: string = '';
  let currentStep: number = 1;

  const next = () => (currentStep = currentStep + 1);
</script>

<BasePage class="flex-wrap items-center justify-center">
  <VerificationDescription
    icon={verification['TezosControl'].icon()}
    title={verification['TezosControl'].title}
    description={verification['TezosControl'].description}
  >
    {#if currentStep == 2}
      <PrimaryButton
        text="Complete Verification"
        class="mt-8"
        onClick={() => {
          lock = true;
          let profile = {
            alias,
            description,
            logo,
          };
          signCoreProfile($userData, $wallet, $networkStr, $DIDKit, profile)
            .then((vc) => {
              let nextClaimMap = verification;
              createJsonBlobUrl(vc).then((url) => {
                nextClaimMap.TezosControl.url = url;
                claimsStream.set(nextClaimMap);
                next();
              });
            })
            .catch(console.error)
            .finally(() => (lock = false));
        }}
        disabled={lock}
      />
    {:else if currentStep > 2}
      <PrimaryButton
        text="Return to Profile"
        class="mt-8"
        onClick={() => navigate('/')}
      />
    {/if}
  </VerificationDescription>
  <div class="flex flex-col justify-evenly md:w-1/2">
    <VerificationStep
      step={1}
      bind:currentStep
      title="Fill in Basic Information"
      description="Self-attest to your brand’s information and link it to other identifiers that have been provided."
    >
      <Label fieldName="alias" value="Alias" class="mt-6 text-white" />
      <Input
        bind:value={alias}
        name="alias"
        placeholder="Enter an alias"
        disabled={currentStep !== 1}
      />

      <Label
        fieldName="description"
        value="Description"
        class="mt-2 text-white"
      />
      <Input
        bind:value={description}
        name="description"
        placeholder="Enter a description"
        disabled={currentStep !== 1}
      />

      <Label fieldName="logo" value="Logo" class="mt-2 text-white" />
      {#if currentStep === 1}
        <Input
          bind:value={logo}
          name="logo"
          placeholder="Enter an image URL"
          disabled={currentStep !== 1}
        />
      {:else}
        <img
          id="logo"
          name="logo"
          src={logo}
          alt="Logo"
          class="object-contain w-32 h-32 bg-white border rounded-lg cursor-not-allowed border-green-550 opacity-60"
        />
      {/if}

      {#if currentStep == 1}
        <PrimaryButton
          text="Submit"
          class="mt-8 lg:w-60"
          onClick={() => {
            next();
          }}
          disabled={alias.length < 4 ||
            description.length < 4 ||
            logo.length < 4}
        />
      {/if}
    </VerificationStep>
  </div>
</BasePage>
