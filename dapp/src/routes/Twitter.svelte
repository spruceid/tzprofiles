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
  import { alert, claimsStream, wallet, userData } from 'src/store';
  import { verifyTweet } from 'src/twitter';
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

  let display = readClaimMap?.twitter?.display;

  let twitterHandle: string = '';
  let tweetURL: string = '';

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
  class="flex flex-1 flex-wrap items-center justify-center text-white 2xl:px-32 sm:px-8 px-4 overflow-hidden-x fade-in overflow-y-auto pt-18 sm:pt-22 md:pt-34"
>
  <div class="flex flex-col justify-evenly w-full md:max-w-144">
    <VerificationDescription {display} iconColor="#00ACEE" />

    <VerificationStep
      step={1}
      bind:currentStep
      title="Enter Account Handle"
      description="Enter your Twitter account handle to verify and include in a message signed via your wallet."
    >
      <div class="flex w-full lg:items-center lg:mt-4 flex-col lg:flex-row">
        <Input
          placeholder="Enter your Twitter handle"
          class="lg:mr-3 mt-4"
          prefix="@"
          bind:value={twitterHandle}
          disabled={currentStep !== 1}
          name="enter-twitter-handle"
        />
        {#if currentStep === 1}
          <PrimaryButton
            text="Submit"
            onClick={() => {
              next(async () => {
                try {
                  twitterClaim = await getPreparedUnsignedAttestation(
                    {
                      type: 'twitter',
                      id: twitterHandle,
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
            class="mt-4 w-max"
            disabled={twitterHandle.length < 1}
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
          class="mt-4 w-full max-w-48 flex items-center justify-center"
          onClick={() => {
            next(async () => {
              try {
                tweetMessage = await getFullAttestation(
                  {
                    type: 'twitter',
                    id: twitterHandle,
                    key: $userData.account.address,
                  },
                  $userData,
                  $wallet
                );
              } catch (err) {}
            });
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
            class="mt-4 sm:mt-8 w-full max-w-48 flex items-center justify-center lg:mr-8 bg-blue-350"
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
            class="mt-4 sm:mt-8 w-full max-w-48 flex items-center justify-center"
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
          class="my-4 sm:my-6"
          bind:value={tweetURL}
          name="enter-tweet-url"
        />
        <PrimaryButton
          text="Verify Tweet"
          class="w-full max-w-48 flex items-center justify-center"
          onClick={() => {
            next(async () => verifyTweet($userData, twitterHandle, tweetURL)).then(
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
