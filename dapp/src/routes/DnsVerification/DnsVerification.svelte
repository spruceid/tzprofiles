<script lang="ts">
  import { useNavigate } from 'svelte-navigator';
  import {
    BasePage,
    CopyButton,
    Input,
    PrimaryButton,
    VerificationStep,
  } from 'components';
  import { claimsStream, wallet, userData, alert } from 'src/store';
  import { verifyDnsInfo, isValidUrl } from 'src/helpers/dns';
  import {
    contentToDraft,
    getPreparedUnsignedAttestation,
    getUnsignedAttestation,
    getSignedAttestation,
  } from 'src/helpers';
  import { newDisplay } from 'src/helpers/claims';
  import type { ClaimMap } from 'src/helpers';

  let navigate = useNavigate();

  let readClaimMap: ClaimMap;
  claimsStream.subscribe((x) => {
    readClaimMap = x;
  });

  let domainUrl: string = '';

  let currentStep: number = 1;
  let lock: boolean = false;
  let dnsClaim: string = '';
  let dnsMessage: string = '';

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
        <div class="mr-3">DNS Verification</div>
      </div>
      <div class="body">
        {newDisplay('dns').description}
      </div>
    </div>

    <VerificationStep
      step={1}
      bind:currentStep
      title="Enter Web Domain Name"
      description="Please enter the web domain you wish to prove ownership of."
    >
      <div class="flex w-full mt-4 flex-wrap">
        <Input
          placeholder="Enter web domain name"
          class=""
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
                  domainUrl = domainUrl.trim();

                  let isValid = isValidUrl(domainUrl);

                  if (!isValid) {
                    throw new Error('Invalid domain');
                  }
                  dnsClaim = getPreparedUnsignedAttestation(
                    {
                      type: 'dns',
                      key: $userData.account.address,
                      id: domainUrl,
                    }
                  );
                } catch (err) {
                  alert.set({
                    variant: 'error',
                    message: `Failed to create DNS claim: ${
                      err?.message || JSON.stringify(err)
                    }`,
                  });
                  throw new Error(err.message);
                }
              });
            }}
            class="mt-4"
            small
          />
        {/if}
      </div>
    </VerificationStep>

    <VerificationStep
      step={2}
      bind:currentStep
      title="Signature Prompt"
      description="Sign the message presented to you containing your domain."
    >
      {#if currentStep >= 2}
        <div class="flex items-center w-full py-2">
          <textarea
            class="overflow-x-auto rounded-lg bg-gray-100 body p-2 mr-4 w-full resize-none mt-4 min-h-22 sm:min-h-32"
            bind:value={dnsClaim}
            readonly
            disabled
          />
          <CopyButton text={dnsClaim} />
        </div>
      {/if}
      {#if currentStep === 2}
        <PrimaryButton
          text="Sign Message"
          class="mt-4 w-full max-w-48 flex items-center justify-center"
          onClick={async () => {
            next(async () => {
              dnsMessage = await getSignedAttestation(
                {
                  type: 'dns',
                  id: domainUrl,
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

    <VerificationStep step={3} bind:currentStep title="Upload TXT Record">
        <div class="body">
          In your DNS settings, add a new TXT record for @ and copy and put the
          following text as the value. Keep in mind that DNS propagation can take
          some time. This process may take a few minutes for the verification to
          successfully complete.

          <br /><br />
          For more information on how to add a TXT record, check out these example
          guides:
          <a
            href="https://www.godaddy.com/help/add-a-txt-record-19232"
            target="_blank">Go Daddy</a
          >,
          <a
            href="https://www.namecheap.com/support/knowledgebase/article.aspx/317/2237/how-do-i-add-txtspfdkimdmarc-records-for-my-domain/"
            target="_blank">Namecheap</a
          >,
          <a
            href="https://vercel.com/support/articles/how-to-manage-vercel-dns-records"
            target="_blank">Vercel</a
          >.
        </div>
      {#if currentStep > 2}
        <div class="flex items-center w-full py-2 mt-4">
          <textarea
            class="overflow-x-auto rounded-lg bg-gray-100 body p-2 mr-4 w-full resize-none min-h-22 sm:min-h-32"
            bind:value={dnsMessage}
            readonly
            disabled
          />
          <CopyButton text={dnsMessage} />
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

    <VerificationStep step={4} bind:currentStep title="Verify Signed Message">
      <div class="body">Verify your signed message below</div>

      {#if currentStep === 4}
        <div class="flex flex-col lg:flex-row">
          <PrimaryButton
            text="Verify Signature"
            class="mt-4 w-full max-w-48 flex items-center justify-center"
            onClick={() => {
              next(async () =>
                verifyDnsInfo(
                  domainUrl,
                  $userData,
                  getUnsignedAttestation({
                    type: 'dns',
                    id: domainUrl,
                    key: $userData.account.address
                  }),
                )
              ).then((vc) => {
                let nextClaimMap = readClaimMap;
                nextClaimMap.dns.preparedContent = JSON.parse(vc);
                nextClaimMap.dns.draft = contentToDraft(
                  'dns',
                  nextClaimMap.dns.preparedContent
                );

                claimsStream.set(nextClaimMap);
                next();
              });
            }}
          />
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
