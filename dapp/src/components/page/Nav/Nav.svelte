<script lang="ts">
  import { Link, useNavigate } from 'svelte-navigator';
  import { FlatButton } from 'components';
  import { claimsStream, contractAddress, userData, wallet } from 'src/store';
  import { addDefaults } from 'src/helpers';
  import { TZProfileLogo } from 'components';
  import { CopyButton } from 'components/buttons';
  import './nav.scss';

  let navigate = useNavigate();

  const unprotected = [
    '/BasicProfile',
    '/TwitterVerification',
    '/TwitterVerificationPublicTweet',
    '/handle',
    '/timestamp',
    '/tweetId',
    '/connect',
    '/deploy',
    '/faq',
    '/privacy-policy',
    '/search',
    '/terms-of-service',
    '/view',
    '/discord',
  ];
  const path = window.location.pathname;
  let isAdminDropdownOpen = false;

  let isUnprotected = false;

  for (let i = 0, n = unprotected.length; i < n; i++) {
    let prefix = unprotected[i];
    if (path.startsWith(prefix)) {
      isUnprotected = true;
      break;
    }
  }

  if ($userData === null && !isUnprotected) navigate('/');
</script>

<nav
  class="flex justify-between px-8 pt-8 pb-4 text-white sm:px-12 xl:pt-14 mb-6"
>
  <div
    on:click={() => {
      if ($userData === null) {
        navigate('/');
      }
    }}
    class="cursor-pointer flex flex-row items-center"
  >
    <TZProfileLogo class="sm:h-12 h-8" />
    <div class="body font-semibold ml-6">Tezos Profiles</div>
  </div>
  <div />
  <div class="flex flex-row items-center">
    {#if $userData}
      <Link to="/connect" class="mx-4 body font-semibold">My Profile</Link>
    {/if}

    <Link to="/search" class="mx-4 body font-semibold">Search Profiles</Link>
    {#if !$wallet}
      <Link to="/faq" class="mx-4 body font-semibold">FAQ</Link>
    {/if}

    {#if $userData}
      <div class="relative">
        <div
          class="flex flex-row items-center address-container py-3 px-4 cursor-pointer overall-wallet-container"
        >
          <div
            class="address-text-container cursor-pointer"
            on:click={() => (isAdminDropdownOpen = !isAdminDropdownOpen)}
          >
            {$userData.account.address}
          </div>
          <CopyButton
            text={$userData.account.address}
            color="gray"
            class="w-4 h-4 ml-2"
          />
        </div>
        {#if isAdminDropdownOpen && $wallet}
          <div class="admin-dropdown-pane">
            <FlatButton
              onClick={() =>
                $wallet.disconnect().then(() => {
                  // TODO: Track state more carefully / explicitly.
                  wallet.set(null);
                  userData.set(null);
                  claimsStream.set(addDefaults({}));
                  contractAddress.set(null);
                  navigate('/');
                })}
              text="Disconnect"
              class="mx-4 body"
            />
          </div>
        {/if}
      </div>
    {/if}
  </div>
</nav>
