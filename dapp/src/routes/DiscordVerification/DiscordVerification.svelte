<script lang="ts">
  import {
    BasePage,
    CopyButton,
    Input,
    PrimaryButton,
    VerificationStep,
  } from 'components';

  import { claimsStream, wallet, userData } from 'src/store';
  import {
    signTwitterClaim,
    getTwitterClaim,
    verifyTweet,
    getTweetMessage,
  } from 'src/twitter';

  import {
    validateDiscordHandle,
    getDiscordClaim,
    getDiscordMessage,
    signDiscordClaim,
  } from 'src/helpers/discord';

  import { contentToDraft } from 'src/helpers';
  import type { ClaimMap } from 'src/helpers';

  import { useNavigate } from 'svelte-navigator';
  let navigate = useNavigate();

  let readClaimMap: ClaimMap;
  claimsStream.subscribe((x) => {
    readClaimMap = x;
  });

  let display = readClaimMap?.twitter?.display;

  let discordHandle = '';
  let tweetURL = '';

  let currentStep: number = 1;
  let lock: boolean = false;
  let twitterClaim: string = '';
  let tweetMessage: string = '';

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
  class="flex flex-grow text-white 2xl:px-32 px-8 overflow-hidden-x flex-wrap items-center justify-center fade-in"
>
  <div class="flex flex-col justify-evenly md:w-1/2">
    <div
      class="flex flex-col mb-4 transition-all ease-in-out duration-500 bg-white p-10 rounded-lg dropshadow-default"
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
      <div class="flex w-full mt-8">
        <Input
          placeholder="Enter your Discord handle"
          class="mr-8"
          prefix="@"
          bind:value={discordHandle}
          disabled={currentStep !== 1}
          name="enter-discord-handle"
        />
        {#if currentStep === 1}
          <PrimaryButton
            text="Submit"
            onClick={() => {
              next(() => getDiscordClaim($userData, discordHandle)).then(
                (res) => {
                  twitterClaim = res;
                  tweetMessage = getDiscordMessage($userData, discordHandle);
                }
              );
            }}
            class="ml-4 lg:ml-0"
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
            class="overflow-x-auto rounded-lg bg-gray-100 body p-2 mr-4 w-full resize-none"
            bind:value={twitterClaim}
            readonly
            disabled
          />
          <CopyButton text={twitterClaim} />
        </div>
      {/if}
      {#if currentStep === 2}
        <PrimaryButton
          text="Signature Prompt"
          class="mt-8 lg:w-48"
          onClick={() => {
            next(() =>
              signDiscordClaim($userData, `${twitterClaim}\n\n`, $wallet)
            ).then(
              (sig) =>
                (tweetMessage = `${getDiscordMessage(
                  $userData,
                  discordHandle
                )}\n\n${sig}`)
            );
          }}
          disabled={lock}
        />
      {/if}
    </VerificationStep>
    <VerificationStep step={3} bind:currentStep title="Send Discord Message">
      <div class="body">
        Follow these instructions to verify your handle:
        <br />
        <br />1) Join this channel
        <a target="_blank" href="https://discord.gg/Jef8Y52mqz">here</a>.
        <br />2) Go to #verification.
        <br /> 3) Copy and post the Discord message above.
        <br /> 4) Right click on the message and click "Copy Message Link".
        <br /> 5) Paste the message link below and continue.
      </div>
      {#if currentStep > 2}
        <div class="flex items-center w-full py-2 mt-8">
          <textarea
            class="overflow-x-auto rounded-lg bg-gray-100 body p-2 mr-4 w-full resize-none"
            bind:value={tweetMessage}
            readonly
            disabled
          />
          <CopyButton text={tweetMessage} />
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

    <VerificationStep
      step={4}
      bind:currentStep
      title="Verify Signature"
      description="Paste your message link to verify."
    >
      {#if currentStep === 4}
        <Input
          placeholder="Enter your tweet url"
          class="my-8"
          bind:value={tweetURL}
          name="enter-tweet-url"
        />
        <PrimaryButton
          text="Verify Tweet"
          class="lg:w-48"
          onClick={() => {
            next(() => verifyTweet($userData, discordHandle, tweetURL)).then(
              (vc) => {
                let nextClaimMap = readClaimMap;
                nextClaimMap.twitter.preparedContent = JSON.parse(vc);
                nextClaimMap.twitter.draft = contentToDraft(
                  'twitter',
                  nextClaimMap.twitter.preparedContent
                );
                claimsStream.set(nextClaimMap);
                next();
              }
            );
          }}
          disabled={lock}
        />
      {:else if currentStep > 4}
        <div class="flex items-center w-full py-2">
          <input
            class="w-full p-2 mr-4 overflow-x-auto rounded-lg resize-none bg-gray-650"
            bind:value={tweetURL}
            readonly
            disabled
          />
          <CopyButton text={tweetURL} />
        </div>
      {/if}
    </VerificationStep>

    {#if currentStep > 4}
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
