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

  const verification: ClaimMap = $claimsStream;

  let lock: boolean = false;
  let alias: string = '';
  let description: string = '';
  let logo: string = '';
  let currentStep: number = 1;

  const next = () => (currentStep = currentStep + 1);
</script>

<BasePage class="justify-center items-center flex-wrap">
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
              let url = createJsonBlobUrl(vc);
              nextClaimMap.TezosControl.url = url;
              claimsStream.set(nextClaimMap);
              next();
            })
            .catch(console.error)
            .finally(() => (lock = false));
        }}
        disabled={lock}
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
      <Label fieldName="alias" value="Alias" class="text-white mt-6" />
      <Input
        bind:value={alias}
        name="alias"
        placeholder="Enter an alias"
        disabled={currentStep !== 1}
      />

      <Label
        fieldName="description"
        value="Description"
        class="text-white mt-2"
      />
      <Input
        bind:value={description}
        name="description"
        placeholder="Enter a description"
        disabled={currentStep !== 1}
      />

      <Label fieldName="logo" value="Logo" class="text-white mt-2" />
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
          class="w-32 h-32 rounded-lg"
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
