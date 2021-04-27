<script lang="ts">
  import { Link, useNavigate } from 'svelte-navigator';
  import { BackButton } from 'components';

  let navigate = useNavigate();

  const path = window.location.pathname;
</script>

<nav class="justify-between text-white flex sm:px-12 pb-4 px-8 xl:pt-20 pt-8">
  {#if path !== '/'}
    <div>
      <BackButton />
    </div>
  {/if}
  <h2 class="text-3xl">Tezos Profiles Viewer</h2>
  {#if path !== '/'}
    <div />
  {/if}
</nav>
