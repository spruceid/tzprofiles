<script lang="ts">
  import {
    BasePage,
    CopyButton,
    Input,
    PrimaryButton,
    VerificationDescription,
    VerificationStep,
  } from 'components';

  import { alert, claimsStream, userData, wallet, witnessUrl } from 'src/store';

  import {
    contentToDraft,
    getPreparedUnsignedMessage,
    getSignedClaim,
  } from 'src/helpers';
  import type { ClaimMap, ClaimUIAssets } from 'src/helpers';

  import { useNavigate } from 'svelte-navigator';
  let navigate = useNavigate();

  let readClaimMap: ClaimMap;
  claimsStream.subscribe((x) => {
    readClaimMap = x;
  });

  // TODO: Change "login" to permissions or auth
  // TODO: reduce to just media permissions?
  const instagramAuthLink = `https://api.instagram.com/oauth/authorize?client_id=${process.env.IG_APP_ID}&redirect_uri=${process.env.WITNESS_URL}/instagram_login&scope=user_profile,user_media&response_type=code`;

  let display: ClaimUIAssets = readClaimMap?.instagram?.display;

  let instagramHandle: string = '';

  let currentStep: number = 1;
  let lock: boolean = false;
  let instagramClaim: string = '';
  let instagramCaption: string = '';

  const verifyInstagramPost = async (): Promise<string> => {
    if (!instagramHandle) {
      throw new Error('Please provide an Instagram handle');
    }

    try {
      let res = await fetch(
        `${witnessUrl}/witness_instagram_post?pk=${
          $userData.account.publicKey
        }&handle=${instagramHandle.trim().replace('@', '')}`
      );

      if (res.ok) {
        alert.set({
          message: "You've completed your Instagram Profile successfully!",
          variant: 'success',
        });

        return await res.text();
      }
      throw new Error(await res.text());
    } catch (e) {
      throw e;
    }
  };

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
    <VerificationDescription {display} />
    <VerificationStep
      step={1}
      bind:currentStep
      title="Enter Account Handle"
      description="Enter your Instagram account handle to verify and include in a message signed via your wallet."
    >
      <div class="flex w-full mt-8">
        <Input
          placeholder="Enter your Instagram handle"
          class="mr-8"
          prefix="@"
          bind:value={instagramHandle}
          disabled={currentStep !== 1}
        />
        {#if currentStep === 1}
          <PrimaryButton
            text="Submit"
            onClick={() => {
              next(async () => {
                try {
                  instagramClaim = getPreparedUnsignedMessage(
                    'instagram',
                    $userData,
                    instagramHandle
                  );
                } catch (err) {
                  alert.set({
                    message: `Failed to create Instagram claim: ${
                      err?.message || JSON.stringify(err)
                    }`,
                    variant: 'error',
                  });
                }
              });
            }}
            class="ml-4 lg:ml-0"
            disabled={instagramHandle.length < 4}
            small
          />
        {/if}
      </div>
    </VerificationStep>
    <VerificationStep
      step={2}
      bind:currentStep
      title="Signature Prompt"
      description="Sign the message presented to you containing your Instagram handle and additional information."
    >
      {#if currentStep >= 2}
        <div class="flex items-center w-full py-2">
          <textarea
            class="overflow-x-auto rounded-lg bg-gray-650 p-2 mr-4 w-full resize-none"
            bind:value={instagramClaim}
            readonly
            disabled
          />
          <CopyButton text={instagramClaim} />
        </div>
      {/if}
      {#if currentStep === 2}
        <PrimaryButton
          text="Signature Prompt"
          class="mt-8 lg:w-48"
          onClick={() => {
            next(async () => {
              try {
                instagramCaption = await getSignedClaim(
                  'instagram',
                  $userData,
                  instagramHandle,
                  $wallet
                );
              } catch (e) {
                alert.set({
                  message: e.message || JSON.stringify(e),
                  variant: 'error',
                });
              }
            });
          }}
          disabled={lock}
        />
      {/if}
    </VerificationStep>
    <VerificationStep
      step={3}
      bind:currentStep
      title="Post Signature Caption"
      description="Create or edit an Instagram post caption to include the signature shown below."
    >
      {#if currentStep > 2}
        <div class="flex items-center w-full py-2">
          <textarea
            class="overflow-x-auto rounded-lg bg-gray-650 p-2 mr-4 w-full resize-none"
            bind:value={instagramCaption}
            readonly
            disabled
          />
          <CopyButton text={instagramCaption} />
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
      title="Verify with Instagram"
      description="First, authenticate with Instagram, see the success message, then press the button to download save the claim."
    >
      {#if currentStep === 4}
        <a href={instagramAuthLink} target="_blank" class="underline"
          >Authenticate with Instagram</a
        >
        <PrimaryButton
          text="Save Claim"
          class="lg:w-48"
          onClick={() => {
            next(async () => {
              try {
                let vc = await verifyInstagramPost();
                let nextClaimMap = readClaimMap;
                nextClaimMap.instagram.preparedContent = JSON.parse(vc);
                nextClaimMap.instagram.draft = contentToDraft(
                  'instagram',
                  nextClaimMap.instagram.preparedContent
                );
                claimsStream.set(nextClaimMap);
              } catch (err) {
                alert.set({
                  message: err.message || JSON.stringify(err),
                  variant: 'error',
                });

                // To prevent the step from advancing.
                throw err
              }
            });
          }}
          disabled={lock}
        />
      {:else if currentStep > 4}
        <div
          class="flex flex-col mb-4 transition-all ease-in-out duration-500 bg-white p-10 rounded-lg dropshadow-default"
        >
          <PrimaryButton
            text="Return to Profile"
            onClick={() => navigate('/connect')}
          />
        </div>
      {/if}
    </VerificationStep>
  </div>
</BasePage>
