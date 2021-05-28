<script lang="ts">
  import ProfileDisplay from 'enums/ProfileDisplay';
  import { onMount } from 'svelte';
  import {
    Card,
    Cat,
    Input,
    LinkInput,
    Label,
    PrimaryButton,
    Spacer,
    CopyButton,
    TwitterIcon,
  } from 'components';

  import {
    alert,
    claimsStream,
    originate,
    userData,
    networkStr,
    loadBasicProfile,
    loadTwitterProfile,
    localBasicProfile,
    localTwitterProfile,
    basicAlias,
    basicDescription,
    basicWebsite,
    basicLogo,
    twitterHandle,
    contractAddress,
    tweetUrl,
    addToKepler,
    addClaims,
  } from 'src/store';
  import type { ClaimMap } from 'src/store';

  import { useNavigate } from 'svelte-navigator';
  let navigate = useNavigate();

  let currentNetwork: string;

  networkStr.subscribe((x) => {
    currentNetwork = x;
  });

  onMount(() => {
    loadBasicProfile($claimsStream);
    loadTwitterProfile($claimsStream);
  });

  $: isAddingClaims = false;

  // TODO: Put this in store and export it to both here and deploy
  const vcsToUpload = (profiles: Array<any>): Array<any> => {
    let vcs: Array<any> = [];

    profiles.forEach((profile) => {
      switch (profile.display) {
        case ProfileDisplay.BASIC: {
          vcs.push($localBasicProfile);
          break;
        }
        case ProfileDisplay.TWITTER: {
          vcs.push($localTwitterProfile);
          break;
        }
      }
    });
    return vcs;
  };

  const hasUrl = (cMap: ClaimMap): boolean => {
    let keys = Object.keys(cMap);
    for (let i = 0, n = keys.length; i < n; i++) {
      let claim = cMap[keys[i]];
      if (claim.url) {
        return true;
      }
    }

    return false;
  };

  const hasBlobUrl = (cMap: ClaimMap): boolean => {
    let keys = Object.keys(cMap);
    for (let i = 0, n = keys.length; i < n; i++) {
      let claim = cMap[keys[i]];
      if (claim.url && claim.url.startsWith('blob')) {
        return true;
      }
    }

    return false;
  };

  const hasAllUrls = (cMap: ClaimMap): boolean => {
    let keys = Object.keys(cMap);
    let found = 0;
    for (let i = 0, n = keys.length; i < n; i++) {
      let claim = cMap[keys[i]];
      // NOTE: THIS REQUIRES KEPLER.
      // TODO: GENERALIZE OVER IT.
      if (claim.url && claim.url.startsWith('kepler')) {
        found++;
      }
    }

    return keys.length === found;
  };

  const findNewClaims = (cMap: ClaimMap) => {
    let keys = Object.keys(cMap);
    let found = [];

    for (let i = 0, n = keys.length; i < n; i++) {
      let claim = cMap[keys[i]];
      if (claim.url && claim.url.startsWith('blob')) {
        found.push(claim);
      }
    }

    return found;
  };

  const getCurrentOrbit = (cMap: ClaimMap) => {
    let keys = Object.keys(cMap);
    for (let i = 0, n = keys.length; i < n; i++) {
      let claim = cMap[keys[i]];
      if (claim.url && claim.url.startsWith('kepler')) {
        let x = claim.url;
        let y = x.slice(9);
        let z = y.split('/');
        return z[0];
      }
    }
  };

  const uploadNewClaim = async () => {
    isAddingClaims = true;
    try {
      const profileStream = $claimsStream;
      const newClaims = findNewClaims(profileStream);
      const orbit = getCurrentOrbit(profileStream);
      const urls = await addToKepler(orbit, ...vcsToUpload(newClaims));

      for (let i = newClaims.length, x = 0; i > x; i--) {
        let profile = newClaims[i-1];
        switch (profile.display) {
          case ProfileDisplay.BASIC: {
            profileStream.TezosControl.url = urls.pop();
            break;
          }
          case ProfileDisplay.TWITTER: {
            profileStream.TwitterControl.url = urls.pop();
            break;
          }
        }
      }

      await addClaims(newClaims);

      claimsStream.set(profileStream);
    } catch (e) {
      alert.set({
        message: `Error in add claim ${e?.message || e}`,
        variant: 'error',
      });
    } finally {
      isAddingClaims = true;
    }
  };

  let agreement: boolean = false;

  const toggle = () => {
    agreement = !agreement;
  };

  const deploy = async () => {
    await originate();
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

  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-alias" value="Alias" />
    {#if $basicAlias}
      <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
    {/if}
  </div>
  {#if $basicAlias}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="basic-alias"
        value={$basicAlias}
        disabled
      />
    </div>
  {:else}
    <LinkInput href="/basic-profile" source="Basic Profile Information" />
  {/if}

  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-description" value="Description" />
    {#if $basicDescription}
      <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
    {/if}
  </div>

  {#if $basicDescription}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="basic-description"
        value={$basicDescription}
        disabled
      />
    </div>
  {:else}
    <LinkInput href="/basic-profile" source="Basic Profile Information" />
  {/if}

  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-website" value="Website" />
    {#if $basicWebsite}
      <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
    {/if}
  </div>

  {#if $basicWebsite}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="basic-website"
        value={$basicWebsite}
        disabled
      />
    </div>
  {:else}
    <LinkInput href="/basic-profile" source="Basic Profile Information" />
  {/if}
  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-logo" value="Logo" />
    {#if $basicLogo}
      <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
    {/if}
  </div>

  <div class="flex items-center justify-between">
    <div
      class="flex items-center justify-center w-32 h-32 text-center border rounded-lg border-green-550 text-gray-350"
      class:opacity-60={true}
    >
      {#if $basicLogo}
        <img
          name="basic-logo"
          class="object-contain"
          src={$basicLogo}
          alt="Basic profile logo"
        />
      {:else}
        <p class="m-2 italic break-words select-none">
          {'Available in '}
          <a href="/basic-profile" class="underline">
            {'Basic profile Information'}
          </a>
        </p>
      {/if}
    </div>
  </div>

  <div class="flex justify-between items-center">
    <Label
      class="mt-4"
      fieldName="basic-twitter-handle"
      value="Twitter Handle"
    />

    {#if $twitterHandle}
      <p class="text-sm text-gray-350 italic mt-2">
        (signed-by tzprofiles.com)
      </p>
    {/if}
  </div>

  {#if $twitterHandle}
    <div class="flex items-center">
      <Input
        prefix="@"
        fluid
        class="font-bold"
        name="basic-twitter-handle"
        value={$twitterHandle}
        disabled
      />
      <a href={$tweetUrl} title="View tweet" target="_blank">
        <TwitterIcon class="h-6 ml-2" color="#00ACEE" />
      </a>
    </div>
  {:else}
    <LinkInput href="/twitter" source="Twitter Account Information" />
  {/if}

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

  {#if hasUrl($claimsStream)}
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
      {#if !hasAllUrls($claimsStream)}
        {#if isAddingClaims}
          Adding claims....
        {:else}
          <PrimaryButton
            text="Add Claims to profile"
            class="mx-auto mt-4 bottom-6"
            disabled={!hasBlobUrl($claimsStream)}
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
        onClick={() => navigate('deploy')}
      />
    {/if}
  {:else}
    <PrimaryButton
      text="Deploy Profile"
      class="mx-auto mt-4 bottom-6"
      disabled
    />
  {/if}
</Card>
