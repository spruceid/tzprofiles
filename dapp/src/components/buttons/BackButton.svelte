<script lang="ts">
  import { BackArrowIcon } from 'components';
  import { useNavigate } from 'svelte-navigator';
  const navigate = useNavigate();
</script>

<button
  aria-label="Return"
  title="Return"
  on:click={() => {
    navigate(-1);
  }}
>
  <BackArrowIcon class="w-6" />
</button>
