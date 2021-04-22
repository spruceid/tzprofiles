<script lang="ts">
  import { Link, useNavigate } from 'svelte-navigator';
  import { BackButton, FlatButton, PrivacyPolicyModal } from 'components';
  import { userData, wallet } from 'src/store';

  let navigate = useNavigate();

  const unprotected = ['/faq', '/terms-of-service'];
  const path = window.location.pathname;

  if ($userData === null && !unprotected.includes(path)) navigate('/');
</script>

<nav class="justify-between text-white flex sm:px-12 pb-4 px-8 xl:pt-14 pt-8">
  <PrivacyPolicyModal />
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
