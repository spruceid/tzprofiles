<script lang="ts">
  import { Link, useNavigate } from 'svelte-navigator';
  import { BackButton, FlatButton } from 'components';
  import { userData, wallet } from 'src/store';

  let navigate = useNavigate();

  if ($userData === null) navigate('/');
</script>

<nav class="justify-between text-white flex sm:px-12 pb-4 px-8 xl:pt-20 pt-8">
  <div>
    {#if window.location.pathname !== '/'}
      <BackButton />
    {/if}
  </div>
  <div>
    {#if window.location.pathname === '/' && !$wallet}
      <Link to="/faq">FAQ</Link>
    {:else}
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
