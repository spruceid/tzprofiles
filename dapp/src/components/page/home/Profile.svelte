<script lang="ts">
  import {
    Card,
    Cat,
    Input,
    Label,
    PrimaryButton,
    Spacer,
    CopyButton,
  } from 'components';

  import { claimsStream, originate, userData } from 'src/store';
  import type { ClaimMap } from 'src/store';

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
</script>

<Card class="w-full md:max-w-md lg:max-w-md text-center relative break-all">
  <Cat class="w-20 h-20 absolute -top-10 mx-auto left-0 right-0 text-center" />
  <h5 class="font-poppins text-xl">Connected As:</h5>
  <div
    class="w-full overflow-hidden overflow-ellipsis mb-4 break-all flex items-center justify-center"
  >
    <p class="font-poppins inline">{$userData.account.address}</p>
    <CopyButton
      text={$userData.account.address}
      color="gray"
      class="w-4 h-4 ml-2"
    />
  </div>

  <Label fieldName="core-alias" value="Alias" />
  <Input
    name="core-alias"
    class="mb-4"
    disabled
    placeholder="Available in Core Profile Information"
  />

  <Label fieldName="core-description" value="Description" />
  <Input
    name="core-description"
    class="mb-4"
    disabled
    placeholder="Available in Core Profile Information"
  />

  <Label fieldName="core-logo" value="Logo" />
  <!-- TODO: update conditional when src is available -->
  <div
    class="border border-green-550 mb-4 h-32 rounded-lg w-32 text-gray-350 flex items-center justify-center text-center"
    class:opacity-60={true}
  >
    {#if false}
      <img name="core-logo" alt="Core profile logo" />
    {:else}
      <p class="m-2 break-words italic select-none">
        Available in Core Profile Information
      </p>
    {/if}
  </div>

  <Label fieldName="core-twitter-handle" value="Twitter Handle" />
  <Input
    name="core-twitter-handle"
    class="mb-4"
    disabled
    placeholder="Available in Twitter Account Information"
  />

  <Spacer />

  {#if hasUrl($claimsStream)}
    <PrimaryButton
      text="Deploy Profile"
      class="bottom-6 mx-auto"
      onClick={async () => {
        console.log('about to originate');
        await originate();
      }}
    />
  {:else}
    <PrimaryButton text="Deploy Profile" class="bottom-6 mx-auto" disabled />
  {/if}
</Card>
