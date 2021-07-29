<script lang="ts">
  import { onMount } from 'svelte';
  import {
    BasePage,
    CopyButton,
    Input,
    PrimaryButton,
    VerificationStep,
  } from 'components';
  import { claimsStream, wallet, userData, alert } from 'src/store';
  import { fetchDnsInfo } from 'src/helpers/dns';
  import {
    contentToDraft,
    getFullSocialMediaClaim,
    getPreparedUnsignedMessage,
  } from 'src/helpers';
  import type { ClaimMap } from 'src/helpers';
  import { useNavigate } from 'svelte-navigator';

  let navigate = useNavigate();

  let readClaimMap: ClaimMap;
  claimsStream.subscribe((x) => {
    readClaimMap = x;
  });

  let domainUrl: string = '';

  let currentStep: number = 1;
  let lock: boolean = false;
  let dnsClaim: string = '';
  let discordMessage: string = '';

  const next = (func: () => Promise<any> = async () => '') => {
    return new Promise<any>((resolve, _) => {
      lock = true;
      func()
        .then((res: any) => {
          currentStep += 1;
          resolve(res);
        })
        .catch(console.error)
        .finally(() => (lock = false));
    });
  };

  onMount(async () => {
    await fetchDnsInfo('www.thekevinz.com');
  });
</script>

<BasePage
  class="flex flex-grow text-white 2xl:px-32 px-8 overflow-hidden-x flex-wrap items-center justify-center fade-in"
>
  <div class="flex flex-col justify-evenly md:w-1/2">
    <div
      class="flex flex-col mb-4 transition-all ease-in-out duration-500 bg-white p-10 rounded-lg dropshadow-default"
    >
      <div
        class="mb-4 text-2xl text-left font-bold body flex flex-row items-center"
      >
        <div class="mr-3">DNS Verification</div>
      </div>
      <div class="body">
        This process is used to link your web domain to your Tezos account by
        entering your domain, signing a message using your private key, entering
        the information into the TXT, and finally retrieving that data to
        verify.
      </div>
    </div>

    <VerificationStep
      step={1}
      bind:currentStep
      title="Enter Domain"
      description="Enter the domain you want want to verify ownership for."
    >
      <div class="flex w-full mt-8">
        <Input
          placeholder="Enter domain"
          class="mr-8"
          bind:value={domainUrl}
          disabled={currentStep !== 1}
          name="enter-domain"
        />
        {#if currentStep === 1}
          <PrimaryButton
            text="Submit"
            onClick={async () => {
              next(async () => {
                try {
                  dnsClaim = await getPreparedUnsignedMessage(
                    'discord',
                    $userData,
                    domainUrl
                  );
                } catch (err) {
                  alert.set({
                    variant: 'error',
                    message: `Failed to create DNS claim: ${
                      err?.message || JSON.stringify(err)
                    }`,
                  });
                }
              });
            }}
            class="ml-4 lg:ml-0"
            small
          />
        {/if}
      </div>
    </VerificationStep>

    <VerificationStep
      step={2}
      bind:currentStep
      title="Sign Prompt"
      description="Sign the message presented to you containing your domain."
    >
      {#if currentStep >= 2}
        <div class="flex items-center w-full py-2 mt-8">
          <textarea
            class="overflow-x-auto rounded-lg bg-gray-100 body p-2 mr-4 w-full resize-none"
            bind:value={dnsClaim}
            readonly
            disabled
          />
          <CopyButton text={dnsClaim} />
        </div>
      {/if}
      {#if currentStep === 2}
        <PrimaryButton
          text="Signature Prompt"
          class="mt-8 lg:w-48"
          onClick={async () => {
            next(async () => {
              discordMessage = await getFullSocialMediaClaim(
                'discord',
                $userData,
                domainUrl,
                $wallet
              );
              console.log(discordMessage);
            });
          }}
          disabled={lock}
        />
      {/if}
    </VerificationStep>

    <VerificationStep step={3} bind:currentStep title="Send Discord Message">
      <div class="body">Follow these instructions to verify your handle:</div>
      {#if currentStep > 2}
        <div class="flex items-center w-full py-2 mt-8">
          <textarea
            class="overflow-x-auto rounded-lg bg-gray-100 body p-2 mr-4 w-full resize-none"
            bind:value={discordMessage}
            readonly
            disabled
          />
          <CopyButton text={discordMessage} />
        </div>
      {/if}
      {#if currentStep === 3}
        <div class="flex flex-col lg:flex-row">
          <PrimaryButton
            text="Done"
            class="mt-8 lg:w-48"
            onClick={() => next()}
          />
        </div>
      {/if}
    </VerificationStep>

    {#if currentStep > 3}
      <div
        class="flex flex-col mb-4 transition-all ease-in-out duration-500 bg-white p-10 rounded-lg dropshadow-default"
      >
        <PrimaryButton
          text="Return to Profile"
          onClick={() => navigate('/connect')}
        />
      </div>
    {/if}
  </div>
</BasePage>
