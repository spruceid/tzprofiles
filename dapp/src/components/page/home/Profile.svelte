<script lang="ts">
  import {
    Card,
    Cat,
    ClaimDisplay,
    PrimaryButton,
    Spacer,
    CopyButton,
  } from 'components';

  import {
    alert,
    claimsStream,
    userData,
    networkStr,
    contractAddress,
    addToKepler,
    addClaims,
  } from 'src/store';

  import { contentToDraft } from 'src/helpers';
  import type { ClaimMap } from 'src/helpers';
  import { useNavigate } from 'svelte-navigator';

  let navigate = useNavigate();

  let currentNetwork: string;

  networkStr.subscribe((x) => {
    currentNetwork = x;
  });

  $: isAddingClaims = false;

  const isAllOnChain = (cMap: ClaimMap): boolean => {
    let keys = Object.keys(cMap);
    let found = 0;
    for (let i = 0, n = keys.length; i < n; i++) {
      let claim = cMap[keys[i]];
      if (claim.onChain) {
        found++;
      }
    }

    return keys.length === found;
  };

  const getCurrentOrbit = (cMap: ClaimMap) => {
    let keys = Object.keys(cMap);
    for (let i = 0, n = keys.length; i < n; i++) {
      let claim = cMap[keys[i]];
      if (claim.irl && claim.irl.startsWith('kepler')) {
        let irl = claim.irl;
        let prefixless = irl.slice(9);
        let orbitPath = prefixless.split('/');
        return orbitPath[0];
      }
    }
  };

  const canUpload = (): boolean => {
    let claims = Object.values($claimsStream);
    for (let i = 0, n = claims.length; i < n; i++) {
      let claim = claims[i];
      if (claim.preparedContent) {
        return true;
      }
    }

    return false;
  };

  const uploadNewClaim = async () => {
    isAddingClaims = true;
    try {
      const nextClaimStream = $claimsStream;
      const newClaims = Object.values(nextClaimStream).filter((claim) => {
        return !!claim.preparedContent;
      });

      const orbit = getCurrentOrbit(nextClaimStream);

      const urls = await addToKepler(
        orbit,
        ...newClaims.map((claim) => claim.preparedContent)
      );

      for (let i = newClaims.length, x = 0; i > x; i--) {
        let profile = newClaims[i - 1];
        let next = nextClaimStream[profile.type];

        next.irl = urls.pop();
        // Is a string because findNewClaims checked.
        next.content = profile.preparedContent;
        next.preparedContent = false;
        next.draft = contentToDraft(next.type, next.content);
        next.onChain = true;

        nextClaimStream[profile.type] = next;
      }

      await addClaims(newClaims);

      claimsStream.set(nextClaimStream);
    } catch (e) {
      alert.set({
        message: `Error in add claim ${e?.message || e}`,
        variant: 'error',
      });
    } finally {
      isAddingClaims = false;
    }
  };

  let agreement: boolean = false;

  const toggle = () => {
    agreement = !agreement;
  };
</script>

<Card
  class="relative self-center w-full text-center break-all md:max-w-md lg:max-w-md"
>
  <Cat class="absolute left-0 right-0 w-20 h-20 mx-auto text-center -top-10" />
  <h5 class="text-xl font-poppins">Connected As:</h5>
  <div
    class="flex items-center justify-center w-full mb-4 overflow-hidden break-all overflow-ellipsis"
  >
    <p class="inline font-poppins">{$userData.account.address}</p>
    <CopyButton
      text={$userData.account.address}
      color="gray"
      class="w-4 h-4 ml-2"
    />
  </div>

  {#each Object.values($claimsStream) as c}
    <ClaimDisplay claim={c} />
  {/each}

  <Spacer class="min-h-8" />

  {#if $contractAddress === null}
    <div class="flex items-center w-full text-gray-650">
      <input id="agreement" on:change={toggle} type="checkbox" />
      <label
        for="agreement"
        class="flex-grow ml-4 text-xs text-left md:text-sm"
      >
        {'I have '}
        <span class="font-bold">{'read'}</span>
        {' and '}
        <span class="font-bold">{'agree'}</span>
        {' with the '}
        <a
          class="underline text-blue-550"
          target="_blank"
          href="/privacy-policy"
        >
          {'Privacy Policy'}
        </a>
        {' and the '}
        <br />
        <a
          class="underline text-blue-550"
          target="_blank"
          href="/terms-of-service"
        >
          {'Terms of Service'}
        </a>
        {'.'}
      </label>
    </div>
  {/if}

  {#if canUpload()}
    {#if $contractAddress !== null}
      <!-- TODO: Stylize -->
      <span class="py-2 text-white rounded bg-green-550">
        {'Tezos Profile deployed at '}
        <a
          class="text-green-900 underline"
          target="_blank"
          href={`https://${
            currentNetwork
              ? currentNetwork === 'edonet.'
                ? 'edo2net.'
                : `${currentNetwork}.`
              : ''
          }tzkt.io/${$userData.account.address}`}
        >
          {'tzkt.io'}
        </a>
      </span>
      {#if !isAllOnChain($claimsStream)}
        {#if isAddingClaims}
          Adding claims....
        {:else}
          <PrimaryButton
            text="Add Claims to profile"
            class="mx-auto mt-4 bottom-6"
            onClick={async () => {
              await uploadNewClaim();
            }}
          />
        {/if}
      {/if}
    {:else}
      <PrimaryButton
        text="Deploy Profile"
        class="mx-auto mt-4 bottom-6"
        disabled={!agreement}
        onClick={() => navigate('/deploy')}
      />
    {/if}
  {/if}
</Card>
