<script lang="ts">
  import { Link, useNavigate } from 'svelte-navigator';
  import { BackButton, FlatButton } from 'components';
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
  let isAdminDropdownOpen = true;
  // export let backHome: boolean = false;

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
  <!-- <div>
    {#if path !== '/'}
      <BackButton home={backHome} />
    {/if}
  </div> -->
  <!-- <TZProfileLogo class="sm:h-12 h-8 mr-2" /> -->
  <div />
  <div class="flex flex-row items-center">
    {#if $userData}
      <Link to="/connect" class="mx-4 body">View My Profile</Link>
    {/if}

    <!-- {#if path !== '/search'} -->
    <Link to="/search" class="mx-4 body">Search Profiles</Link>
    <!-- {/if} -->
    {#if path !== '/faq' && !$wallet}
      <Link to="/faq" class="mx-4 body">FAQ</Link>
    {/if}

    {#if $userData}
      <div class="relative">
        <div
          class="address-container py-3 px-4 cursor-pointer"
          on:click={() => (isAdminDropdownOpen = !isAdminDropdownOpen)}
        >
          {$userData.account.address}
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
