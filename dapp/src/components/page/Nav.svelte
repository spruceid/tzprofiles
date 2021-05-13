<script lang="ts">
  import { Link, useNavigate } from 'svelte-navigator';
  import { BackButton, FlatButton } from 'components';
  import { claimsStream, contractAddress, newClaimsStream, userData, wallet } from 'src/store';

  let navigate = useNavigate();

  const unprotected = [
    '/connect',
    '/deploy',
    '/faq',
    '/privacy-policy',
    '/search',
    '/terms-of-service',
    '/view'
  ];
  const path = window.location.pathname;

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

<nav class="flex justify-between px-8 pt-8 pb-4 text-white sm:px-12 xl:pt-14">
  <div>
    {#if path !== '/'}
      <BackButton />
    {/if}
  </div>
  <div>
    {#if path !== '/search'}
      <Link to="/search" class="mx-1.5">Search Profiles</Link>
    {/if}
    {#if path !== '/faq' && !$wallet}
      <Link to="/faq" class="mx-1.5">FAQ</Link>
    {:else if $wallet}
      <FlatButton
        onClick={() =>
          $wallet.disconnect().then(() => {
            // TODO: Track state more carefully / explicitly.
            wallet.set(null);
            userData.set(null);
            claimsStream.set(newClaimsStream());
            contractAddress.set(null);
            navigate('/');
          })}
        text="Disconnect"
        class="mx-1.5"
      />
    {/if}
  </div>
</nav>
