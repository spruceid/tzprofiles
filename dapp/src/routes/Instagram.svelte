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
    getUnsignedAttestation,
    getPreparedUnsignedAttestation,
    getSignedAttestation,
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
  let authClicked: boolean = false;
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
        }&handle=${instagramHandle.trim().replace('@', '')}&sig_type=tezos&sig_target=${getUnsignedMessage('instagram', $userData, instagramHandle)}`
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
      description="Enter the Instagram handle you would like to add to your Tezos Profile."
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
                  instagramClaim = getPreparedUnsignedAttestation(
                    {
                      type: 'instagram',
                      id: instagramHandle,
                      key: $userData.account.address,
                    }
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
                instagramCaption = await getSignedAttestation(
                  {
                    type: 'instagram',
                    id: instagramHandle,
                    key: $userData.account.address,
                  },
                  $userData,
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
      title="Include Signature in Post"
      description="Edit an existing post or create a new post from your Instagram account that includes this signature anywhere in its caption."
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
      description="Authenticate with Instagram to enable a one-time look up of your posts to find the signature."
    >
      {#if currentStep === 4}
        <div class="flex items-center w-full py-2">
          <a
            href={instagramAuthLink}
            target="_blank"
            class="lg:w-48 button-container py-4 mr-8 text-center"
            on:click={() => {
              authClicked = true;
            }}
          >
            Authenticate
          </a>
          <PrimaryButton
            text="Done"
            disabled={!authClicked}
            class="lg:w-48"
            onClick={() => {
              next(async () => {});
            }}
          />
        </div>
      {/if}
    </VerificationStep>
    <VerificationStep
      step={5}
      bind:currentStep
      title="Validate and Save Claim to Your Profile"
      description="Finalize your claim by verifying the added signature."
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
