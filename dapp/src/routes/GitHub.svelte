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

  let display = readClaimMap?.github?.display;

  let githubHandle: string = '';
  let gistUrl: string = '';

  let currentStep: number = 1;
  let lock: boolean = false;
  let githubClaim: string = '';
  let githubMessage: string = '';

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

  const verifyGist = async (): Promise<string> => {
    try {

      let ref = `${
        process.env.WITNESS_URL
      }/witness_github?pk=${
        $userData.account.publicKey
      }&handle=${
        githubHandle
      }&gistId=${
        gistUrl.split("/")[gistUrl.split("/").length - 1]
      }`;
      let res = await fetch(ref);
      if (res.ok) {
        alert.set({
          message: "You've completed your GitHub Profile successfully!",
          variant: 'success',
        });

        return await res.text();
      }
      throw new Error(await res.text());
    } catch (e) {
      alert.set({
        message: e.message || JSON.stringify(e),
        variant: 'error',
      });

      throw e;
    }
  };
</script>

<BasePage
  class="flex flex-1 flex-wrap items-center justify-center text-white 2xl:px-32 sm:px-8 px-4 overflow-hidden-x fade-in overflow-y-auto pt-18 sm:pt-22 md:pt-34"
>
  <div class="flex flex-col justify-evenly w-full md:max-w-144">
    <VerificationDescription {display} />

    <VerificationStep
      step={1}
      bind:currentStep
      title="Enter Username"
      description="Enter your GitHub username to verify and include in a message signed by your wallet."
    >
      <div class="flex w-full mt-4 flex-wrap">
        <Input
          placeholder="Enter your GitHub username"
          class=""
          prefix=""
          bind:value={githubHandle}
          disabled={currentStep !== 1}
          name="enter-github-username"
        />
        {#if currentStep === 1}
          <PrimaryButton
            text="Submit"
            onClick={() => {
              next(async () => {
                try {
                  githubClaim = await getPreparedUnsignedAttestation({
                    type: 'github',
                    id: githubHandle,
                    key: $userData.account.address,
                  });
                } catch (err) {
                  alert.set({
                    variant: 'error',
                    message: `Failed to create GitHub claim: ${
                      err?.message || JSON.stringify(err)
                    }`,
                  });
                }
              });
            }}
            class="mt-4"
            disabled={githubHandle.length < 1}
            small
          />
        {/if}
      </div>
    </VerificationStep>
    <VerificationStep
      step={2}
      bind:currentStep
      title="Signature Prompt"
      description="Sign the message presented to you containing your GitHub handle and additional information."
    >
      {#if currentStep >= 2}
        <CopyTextArea bind:value={githubClaim} />
      {/if}
      {#if currentStep === 2}
        <PrimaryButton
          text="Signature Prompt"
          class="mt-4 w-full max-w-48 flex items-center justify-center"
          onClick={() => {
            next(async () => {
              try {
                githubMessage = await getFullAttestation(
                  {
                    type: 'github',
                    id: githubHandle,
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
      title="Gist Message"
      description="Post your signed message in any public Gist owned by your account, new or pre-existing, to create a link between your Tezos account and your GitHub profile."
    >
      {#if currentStep > 2}
        <CopyTextArea bind:value={githubMessage} />
      {/if}
      {#if currentStep === 3}
        <div class="flex flex-col lg:flex-row">
          <PrimaryButton
            text="Create New Gist"
            class="mt-4 sm:mt-8 w-full max-w-48 flex items-center justify-center lg:mr-8 bg-blue-350"
            onClick={() => {
              window.open('https://gist.github.com/');
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
      description="Paste the Gist URL referencing the signature in order to verify it. Remember, it must be a public Gist!"
    >
      {#if currentStep === 4}
        <Input
          placeholder="Enter your gist URL"
          class="my-4 sm:my-6"
          bind:value={gistUrl}
          name="enter-gist-url"
        />
        <PrimaryButton
          text="Verify Gist"
          class="w-full max-w-48 flex items-center justify-center"
          onClick={() => {
            next(verifyGist).then((vc) => {
              let nextClaimMap = readClaimMap;
              nextClaimMap.github.preparedContent = JSON.parse(vc);
              nextClaimMap.github.draft = contentToDraft(
                'github',
                nextClaimMap.github.preparedContent
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
            bind:value={gistUrl}
            readonly
            disabled
          />
          <CopyButton text={gistUrl} />
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
