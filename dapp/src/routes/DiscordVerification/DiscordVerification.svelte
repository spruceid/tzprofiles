<script lang="ts">
  import {
    BasePage,
    CopyButton,
    Input,
    PrimaryButton,
    VerificationStep,
  } from 'components';
  import { claimsStream, wallet, userData, alert } from 'src/store';
  import { validateDiscordHandle, verifyDiscord } from 'src/helpers/discord';
  import {
    contentToDraft,
    getFullAttestation,
    getPreparedUnsignedAttestation,
  } from 'src/helpers';
  import type { ClaimMap } from 'src/helpers';
  import { useNavigate } from 'svelte-navigator';

  let navigate = useNavigate();

  let readClaimMap: ClaimMap;
  claimsStream.subscribe((x) => {
    readClaimMap = x;
  });

  let discordHandle: string = '';
  let discordMessageUrl: string = '';

  let currentStep: number = 1;
  let lock: boolean = false;
  let discordClaim: string = '';
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
</script>

<BasePage
  class="flex flex-1 flex-wrap items-center justify-center text-white 2xl:px-32 sm:px-8 px-4 overflow-hidden-x fade-in overflow-y-auto pt-18 sm:pt-22 md:pt-34"
>
  <div class="flex flex-col justify-evenly w-full md:max-w-144">
    <div
      class="flex flex-col mb-4 transition-all ease-in-out duration-500 bg-white p-4 sm:p-10 rounded-lg dropshadow-default"
    >
      <div
        class="mb-4 text-2xl text-left font-bold body flex flex-row items-center"
      >
        <div class="mr-3">Discord Verification</div>
      </div>
      <div class="body">
        This process is used to link your Discord account to your Tezos account
        by signing a message using your private key, entering your Discord
        username, and posting that message.
      </div>
    </div>

    <VerificationStep
      step={1}
      bind:currentStep
      title="Enter Discord Handle"
      description="Enter your Discord account handle (ex: kevin#1234) to verify and include in a message signed via your wallet."
    >
      <div class="flex w-full mt-4 flex-wrap">
        <Input
          placeholder="Enter your Discord handle"
          class="mt-4"
          bind:value={discordHandle}
          disabled={currentStep !== 1}
          name="enter-discord-handle"
        />
        {#if currentStep === 1}
          <PrimaryButton
            text="Submit"
            onClick={async () => {
              next(async () => {
                try {
                  discordClaim = await getPreparedUnsignedAttestation(
                    {
                      type: 'discord',
                      id: discordHandle,
                      key: $userData.account.address,
                    }
                  );
                } catch (err) {
                  alert.set({
                    variant: 'error',
                    message: `Failed to create Twitter claim: ${
                      err?.message || JSON.stringify(err)
                    }`,
                  });
                }
              });
            }}
            class="mt-4"
            disabled={validateDiscordHandle(discordHandle)}
            small
          />
        {/if}
      </div>
    </VerificationStep>

    <VerificationStep
      step={2}
      bind:currentStep
      title="Sign Prompt"
      description="Sign the message presented to you containing your Discord handle and additional information."
    >
      {#if currentStep >= 2}
        <div class="flex items-center w-full py-2 mt-8">
          <textarea
            class="overflow-x-auto rounded-lg bg-gray-100 body p-2 mr-4 w-full resize-none min-h-22 sm:min-h-32"
            bind:value={discordClaim}
            readonly
            disabled
          />
          <CopyButton text={discordClaim} />
        </div>
      {/if}
      {#if currentStep === 2}
        <PrimaryButton
          text="Signature Prompt"
          class="mt-4 w-full max-w-48 flex items-center justify-center"
          onClick={async () => {
            next(async () => {
              discordMessage = await getFullAttestation(
                {
                  type: 'discord',
                  id: discordHandle,
                  key: $userData.account.address,
                },
                $userData,
                $wallet
              );
            });
          }}
          disabled={lock}
        />
      {/if}
    </VerificationStep>

    <VerificationStep step={3} bind:currentStep title="Send Discord Message">
      <div class="body">
        Follow these instructions to verify your handle:
        <br />
        <br />1) Join this server
        <a target="_blank" href="https://discord.gg/Jef8Y52mqz">here</a>.
        <br />2) Go to #verification.
        <br /> 3) Copy and post the Discord message below.
        <br /> 4) Right click on the message and click "Copy Message Link".
        <br /> 5) Paste the message link below and continue.
      </div>
      {#if currentStep > 2}
        <div class="flex items-center w-full py-2 mt-8">
          <textarea
            class="overflow-x-auto rounded-lg bg-gray-100 body p-2 mr-4 w-full resize-none min-h-22 sm:min-h-32"
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
            class="mt-4 w-full max-w-48 flex items-center justify-center"
            onClick={() => next()}
          />
        </div>
      {/if}
    </VerificationStep>

    <VerificationStep
      step={4}
      bind:currentStep
      title="Verify Signature"
      description="Paste your message link to verify."
    >
      {#if currentStep === 4}
        <Input
          placeholder="Enter your Discord message link"
          class="my-4 sm:my-6"
          bind:value={discordMessageUrl}
          name="enter-discord-message-url"
        />
        <PrimaryButton
          text="Verify Message"
          class="w-full max-w-48 flex items-center justify-center"
          onClick={() => {
            next(async () =>
              verifyDiscord($userData, discordHandle, discordMessageUrl)
            ).then((vc) => {
              let nextClaimMap = readClaimMap;
              nextClaimMap.discord.preparedContent = JSON.parse(vc);
              nextClaimMap.discord.draft = contentToDraft(
                'discord',
                nextClaimMap.discord.preparedContent
              );

              claimsStream.set(nextClaimMap);
              next();
            });
          }}
          disabled={lock}
        />
      {:else if currentStep > 4}
        <div class="flex items-center w-full py-2">
          <input
            class="w-full p-2 mr-4 overflow-x-auto rounded-lg resize-none bg-gray-650"
            bind:value={discordMessageUrl}
            readonly
            disabled
          />
          <CopyButton text={discordMessageUrl} />
        </div>
      {/if}
    </VerificationStep>

    {#if currentStep > 4}
      <div
        class="flex flex-col mb-4 transition-all ease-in-out duration-500 bg-white p-4 sm:p-10 rounded-lg dropshadow-default"
      >
        <PrimaryButton
          text="Return to Profile"
          onClick={() => navigate('/connect')}
        />
      </div>
    {/if}
  </div>
</BasePage>
