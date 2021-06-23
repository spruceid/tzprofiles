<script lang="ts">
  import { SvelteComponent, onMount } from 'svelte';
  import { ClipboardIcon } from 'components';

  export let icon: typeof SvelteComponent;
  export let title: string = '';
  export let color: string = 'black';
  export let href: string;
  export let download: string = '';
  export { clazz as class };
  let clazz: string = 'w-8 h-8';
</script>

<a aria-label={title} {title} alt={title} {href} {download} class={clazz}>
  <svelte:component this={icon} {color} />
</a>
