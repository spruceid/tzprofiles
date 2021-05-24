<script lang="ts">
  import {
    BasePage,
    CopyButton,
    Input,
    PrimaryButton,
    VerificationDescription,
    VerificationStep,
    CopyTextArea,
  } from 'components';

  import { claimsStream, wallet, userData } from 'src/store';
  import {
    signTwitterClaim,
    getTwitterClaim,
    verifyTweet,
    getTweetMessage,
  } from 'src/twitter';

  import { contentToDraft } from 'src/helpers';
  import type { ClaimMap } from 'src/helpers';

  import { useNavigate } from 'svelte-navigator';
  let navigate = useNavigate();

  let readClaimMap: ClaimMap;
  claimsStream.subscribe((x) => {
    readClaimMap = x;
  });

  let display = readClaimMap?.twitter?.display;

  let twitterHandle = '';
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

<BasePage class="flex-wrap items-center justify-center">
  <VerificationDescription
    icon={display.icon}
    title={display.title}
    description={display.description}
  >
    {#if currentStep > 4}
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
      title="Enter Account Handle"
      description="Enter your Twitter account handle to verify and include in a message signed via your wallet."
    >
      <div class="flex w-full mt-8">
        <Input
          placeholder="Enter your Twitter handle"
          class="mr-8"
          prefix="@"
          bind:value={twitterHandle}
          disabled={currentStep !== 1}
        />
        {#if currentStep === 1}
          <PrimaryButton
            text="Submit"
            onClick={() => {
              next(() => getTwitterClaim($userData, twitterHandle)).then(
                (res) => {
                  twitterClaim = res;
                  tweetMessage = getTweetMessage($userData, twitterHandle);
                }
              );
            }}
            class="ml-4 lg:ml-0"
            disabled={twitterHandle.length < 4}
            small
          />
        {/if}
      </div>
    </VerificationStep>
    <VerificationStep
      step={2}
      bind:currentStep
      title="Signature Prompt"
      description="Sign the message presented to you containing your Twitter handle and additional information."
    >
      {#if currentStep >= 2}
        <CopyTextArea bind:value={twitterClaim} />
      {/if}
      {#if currentStep === 2}
        <PrimaryButton
          text="Signature Prompt"
          class="mt-8 lg:w-48"
          onClick={() => {
            next(() =>
              signTwitterClaim($userData, `${twitterClaim}\n\n`, $wallet)
            ).then(
              (sig) =>
                (tweetMessage = `${getTweetMessage(
                  $userData,
                  twitterHandle
                )}\n\n${sig}`)
            );
          }}
          disabled={lock}
        />
      {/if}
    </VerificationStep>
    <VerificationStep
      step={3}
      bind:currentStep
      title="Tweet Message"
      description="Tweet out your signed messaged to create a link between your Tezos account and your Twitter profile."
    >
      {#if currentStep > 2}
        <CopyTextArea bind:value={tweetMessage} />
      {/if}
      {#if currentStep === 3}
        <div class="flex flex-col lg:flex-row">
          <PrimaryButton
            text="Tweet"
            class="mt-8 lg:w-48 lg:mr-8 bg-blue-350"
            onClick={() => {
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURI(
                  tweetMessage
                )}`
              );
            }}
          />

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
      description="Paste your tweet URL in order to verify it."
    >
      {#if currentStep === 4}
        <Input
          placeholder="Enter your tweet url"
          class="my-8"
          bind:value={tweetURL}
        />
        <PrimaryButton
          text="Verify Tweet"
          class="lg:w-48"
          onClick={() => {
            next(() => verifyTweet($userData, twitterHandle, tweetURL)).then(
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
  </div>
</BasePage>
