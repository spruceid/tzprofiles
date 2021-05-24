<script lang="ts">
  import { BackArrowIcon } from 'components';
  import { useNavigate } from 'svelte-navigator';
  const navigate = useNavigate();
  export let home: boolean = false;
</script>

<button
  aria-label="Return"
  title="Return"
  on:click={() => {
    if (home) {
      navigate('/connect');
      return;
    }
    navigate(-1);
  }}
>
  <BackArrowIcon class="w-6" />
</button>
