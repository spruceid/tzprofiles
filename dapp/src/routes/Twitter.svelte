<script lang="ts">
  import {
    BasePage,
    CopyButton,
    Input,
    PrimaryButton,
    VerificationDescription,
    VerificationStep,
  } from 'components';

  import {
    createJsonBlobUrl,
    claimsStream,
    wallet,
    userData,
    alert,
  } from 'src/store';
  import { signTwitterClaim, getTwitterClaim, verifyTweet } from 'src/twitter';

  import type { ClaimMap } from 'src/store';

  let verification: ClaimMap;
  claimsStream.subscribe((x) => {
    verification = x;
  });

  let currentStep: number = 1;
  let twitterHandle: string = '';
  let lock: boolean = false;
  let signature: string = '';
  let tweetURL: string = '';
  let twitterClaim: string = '';

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

<BasePage class="justify-center items-center flex-wrap">
  <VerificationDescription
    icon={verification['TwitterControl'].icon()}
    title={verification['TwitterControl'].title}
    description={verification['TwitterControl'].description}
  />
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
        <div class="flex py-2 items-center w-full">
          <textarea
            class="overflow-x-auto rounded-lg bg-gray-650 p-2 mr-4 w-full resize-none"
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
            next(() => signTwitterClaim($userData, twitterClaim, $wallet)).then(
              (sig) => (signature = sig)
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
        <div class="flex py-2 items-center w-full">
          <textarea
            class="overflow-x-auto rounded-lg bg-gray-650 p-2 mr-4 w-full resize-none"
            bind:value={signature}
            readonly
            disabled
          />
          <CopyButton text={signature} />
        </div>
      {/if}
      {#if currentStep === 3}
        <div class="flex flex-col lg:flex-row">
          <PrimaryButton
            text="Tweet"
            class="mt-8 lg:w-48 lg:mr-8 bg-blue-350"
            onClick={() => {
              window.open(`https://twitter.com/intent/tweet?text=${signature}`);
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
                let nextClaimMap = verification;
                let url = createJsonBlobUrl(vc);
                console.log(url);
                nextClaimMap.TwitterControl.url = url;
                claimsStream.set(nextClaimMap);
              }
            );
          }}
          disabled={lock}
        />
      {:else if currentStep > 4}
        <div class="flex py-2 items-center w-full">
          <input
            class="overflow-x-auto rounded-lg bg-gray-650 p-2 mr-4 w-full resize-none"
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
