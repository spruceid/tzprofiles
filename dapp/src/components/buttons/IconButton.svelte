<script lang="ts">
  import { SvelteComponent, onMount } from 'svelte';
  import { ClipboardIcon } from 'components';

  export let icon: SvelteComponent;
  export let title: string = '';
  export let color: string = 'white';
  export let onClick: () => void;
  export { clazz as class };
  let clazz: string = 'w-8 h-8';
</script>

<button aria-label={title} {title} on:click={onClick} class={clazz}>
  <svelte:component this={icon} {color} />
</button>
