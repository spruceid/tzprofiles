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
  class="flex justify-between px-4 pt-4 md:pt-8 pb-4 text-white md:px-12 xl:pt-10 fixed top-0 left-0 w-full bg-blue-light"
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
    <div class="body font-semibold ml-2 sm:ml-6 ml-4 hidden sm:flex">Tezos Profiles</div>
  </div>
  <div />
  <div class="flex flex-row items-center">
    {#if $userData}
      <Link to="/connect" class="sm:ml-6 ml-4 body font-semibold">My Profile</Link>
    {/if}

    <Link to="/search" class="sm:ml-6 ml-4 body font-semibold">Search Profiles</Link>
    {#if !$wallet}
      <Link to="/faq" class="sm:ml-6 ml-4 body font-semibold">FAQ</Link>
    {/if}

    {#if $userData}
      <div class="relative sm:ml-6 ml-2">
        <div
          class="flex flex-row items-center address-container py-3 px-4 cursor-pointer overall-wallet-container"
        >
          <div
            class="address-text-container cursor-pointer mr-2"
            on:click={() => (isAdminDropdownOpen = !isAdminDropdownOpen)}
          >
            {$userData.account.address.slice(0,5)}...{$userData.account.address.slice(-4)}
          </div>
          <CopyButton
            text={$userData.account.address}
            color="gray"
            class="w-4 h-4"
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
