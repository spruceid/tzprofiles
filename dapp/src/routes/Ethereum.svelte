<script lang="ts">
  import {
    BasePage,
    PrimaryButton,
    VerificationDescription,
    VerificationStep,
    EthereumIcon,
  } from 'components';

  import detectEthereumProvider from '@metamask/detect-provider';

  import { completeIssueCredential, prepareIssueCredential } from 'didkit-wasm';

  import { alert, claimsStream, userData } from 'src/store';
  import { v4 as uuid } from 'uuid';
  import { contentToDraft } from 'src/helpers';
  import type { ClaimMap } from 'src/helpers';

  import { useNavigate } from 'svelte-navigator';
  let navigate = useNavigate();

  let readClaimMap: ClaimMap;
  claimsStream.subscribe((x) => {
    readClaimMap = x;
  });

  let display = readClaimMap?.ethereum?.display;

  $: address = false;
  $: addresses = [];
  $: eth = false;
  $: currentStep = 1;

  const connectMetaMask = async () => {
    eth = await detectEthereumProvider();
    if (eth) {
      addresses = await eth.request({ method: 'eth_requestAccounts' });
    } else {
      alert.set({
        message: 'No metamask extension found',
        variant: 'error',
      });

      return;
    }

    if (addresses.length) {
      address = addresses[0];
      currentStep = currentStep + 1;
      return;
    }

    alert.set({
      message: 'No ethereum address selected',
      variant: 'error',
    });
  };

  const issue = async () => {
    if (!address) {
      alert.set({
        message: 'No Ethereum address selected',
        variant: 'error',
      });
      return;
    }

    let vcStr = await signEthereumClaim();

    let nextClaimMap = $claimsStream;
    nextClaimMap.ethereum.preparedContent = JSON.parse(vcStr);
    nextClaimMap.ethereum.draft = contentToDraft(
      'ethereum',
      nextClaimMap.ethereum.preparedContent
    );

    claimsStream.set(nextClaimMap);

    alert.set({
      message:
        "You've completed the Ethereum Address Control Claim successfully!",
      variant: 'success',
    });

    // complete = true;
    currentStep = currentStep + 1;
  };

  const signEthereumClaim = async (): Promise<string> => {
    if (!address) {
      alert.set({
        message: 'No Ethereum address selected',
        variant: 'error',
      });
      return;
    }

    try {
      const did = `did:pkh:eth:${address}`;

      const credential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://tzprofiles.com/2021/ethereum-address-control-v1.jsonld',
        ],
        id: 'urn:uuid:' + uuid(),
        issuer: did,
        issuanceDate: new Date().toISOString(),
        type: ['VerifiableCredential', 'EthereumAddressControl'],
        credentialSubject: {
          address: address,
          sameAs: $userData.account.address,
        },
      };

      const proofOptions = {
        verificationMethod: did + '#Recovery2020',
        proofPurpose: 'assertionMethod',
        eip712Domain: {
          primaryType: 'VerifiableCredential',
          domain: {
            name: 'Tezos Profiles Verifiable Credential',
          },
          messageSchema: {
            EIP712Domain: [{ name: 'name', type: 'string' }],
            VerifiableCredential: [
              { name: '@context', type: 'string[]' },
              { name: 'id', type: 'string' },
              { name: 'type', type: 'string[]' },
              { name: 'issuer', type: 'string' },
              { name: 'issuanceDate', type: 'string' },
              { name: 'credentialSubject', type: 'CredentialSubject' },
              { name: 'proof', type: 'Proof' },
            ],
            CredentialSubject: [
              { name: 'address', type: 'string' },
              { name: 'sameAs', type: 'string' },
            ],
            Proof: [
              { name: '@context', type: 'string' },
              { name: 'verificationMethod', type: 'string' },
              { name: 'created', type: 'string' },
              { name: 'proofPurpose', type: 'string' },
              { name: 'type', type: 'string' },
            ],
          },
        },
      };

      const keyType = {
        kty: 'EC',
        crv: 'secp256k1',
        alg: 'ES256K-R',
        key_ops: ['signTypedData'],
      };
      const credStr = JSON.stringify(credential);

      const prepStr = await prepareIssueCredential(
        credStr,
        JSON.stringify(proofOptions),
        JSON.stringify(keyType)
      );

      const preparation = JSON.parse(prepStr);

      const typedData = preparation.signingInput;
      if (!typedData || !typedData.primaryType) {
        throw new Error('Expected EIP-712 TypedData');
      }

      const signature = await eth.request({
        method: 'eth_signTypedData_v4',
        params: [address, JSON.stringify(typedData)],
      });

      return await completeIssueCredential(credStr, prepStr, signature);
    } catch (err) {
      alert.set({
        message: `Failed to create Ethereum claim: ${err?.message || err}`,
        variant: 'error',
      });
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
      title="Connect using MetaMask"
      description="Connect to your Ethereum address using MetaMask."
    >
      <div class="flex flex-col">
        {#if currentStep === 1}
          <PrimaryButton
            class="my-4 w-full max-w-48"
            text="Connect"
            title="Connect"
            onClick={connectMetaMask}
          />
        {/if}
        {#if currentStep > 1}
          <div class="mt-4 body">Connected to <span class="break-all">{address}</span></div>
        {/if}
      </div>
    </VerificationStep>
    <VerificationStep
      step={2}
      bind:currentStep
      title="Signature Challenge"
      description="Sign an EIP712 signature challenge in order to demonstrate control over your selected address and issue a credential."
    >
      <div class="flex flex-col lg:flex-row">
        {#if currentStep === 2}
          <PrimaryButton text="Sign" class="mt-8" onClick={issue} />
        {/if}

        {#if currentStep > 2}
          <PrimaryButton
            text="Return to Profile"
            class="mt-8"
            onClick={() => navigate('/connect')}
          />
        {/if}
      </div>
    </VerificationStep>
  </div>
</BasePage>
