<script lang="ts">
  import { Link, useNavigate } from 'svelte-navigator';
  import { BackButton, FlatButton } from 'components';
  import { userData, wallet } from 'src/store';

  let navigate = useNavigate();

  const unprotected = ['/faq', '/terms-of-service', '/privacy-policy'];
  const path = window.location.pathname;

  if ($userData === null && !unprotected.includes(path)) navigate('/');
</script>

<nav class="flex justify-between px-8 pt-8 pb-4 text-white sm:px-12 xl:pt-14">
  <div>
    {#if path !== '/'}
      <BackButton />
    {/if}
  </div>
  <div>
    {#if path !== '/faq' && !$wallet}
      <Link to="/faq">FAQ</Link>
    {:else if $wallet}
      <FlatButton
        onClick={() =>
          $wallet.disconnect().then(() => {
            wallet.set(null);
            userData.set(null);
            navigate('/');
          })}
        text="Disconnect"
      />
    {/if}
  </div>
</nav>
