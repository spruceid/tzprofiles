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

  const instagramAuthLink = `https://api.instagram.com/oauth/authorize?client_id=${process.env.IG_APP_ID}&redirect_uri=https://witness.tzprofiles.com/instagram_login&scope=user_profile,user_media&response_type=code`;

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
      title="Enter Instagram Handle"
      description="Enter your Instagram handle for the account you want to link to your Tezos Profile."
    >
      <div class="flex w-full mt-8">
        <Input
          placeholder="Enter Instagram handle"
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
      description="Sign a message to prove ownership of your Tezos Profile"
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
      title="Include Signature in Caption"
      description="Edit (or create a new) Post from your Instagram account which includes the below signature anywhere in it's caption."
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
      description="Authenticate with Instagram to allow a one-time look up of your posts to find the signature"
    >
      {#if currentStep === 4}
        <div class="flex items-center w-full py-2">
          <a
            href={instagramAuthLink}
            target="_blank"
            class="lg:w-48 button-container py-4"
          >
            Authenticate with Instagram
          </a>
        </div>
        <div class="flex items-center w-full py-2">
          <PrimaryButton
            text="Done"
            class="lg:w-48"
            onClick={() => {
              next(async () => {});
            }}
          />
        </div>
      {/if}
    </VerificationStep>
    <VerificationStep
      step={4}
      bind:currentStep
      title="Validate and save claim to your profile"
      description="Validate and finalize your claim by verifying the signature"
    >
      {#if currentStep === 5}
        <div class="flex items-center w-full py-2">
          <PrimaryButton
            text="Verify Claim"
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
                  throw err;
                }
              });
            }}
            disabled={lock}
          />
        </div>
      {:else if currentStep > 5}
        <div class="flex items-center w-full py-2">
          <PrimaryButton
            text="Return to Profile"
            onClick={() => navigate('/connect')}
          />
        </div>
      {/if}
    </VerificationStep>
  </div>
</BasePage>
