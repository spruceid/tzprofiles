<script lang="ts">
  import { onMount } from 'svelte';
  import { ClipboardIcon } from 'components';

  export let text: string = '';
  export let color: string = 'white';
  export { clazz as class };
  let clazz: string = 'w-8 h-8';

  let copyToClipboard: () => void;

  onMount(() => {
    copyToClipboard = () => navigator.clipboard.writeText(text);
  });
</script>

<button
  aria-label="Copy to clipboard"
  title="Copy to clipboard"
  on:click={copyToClipboard}
  class={clazz}
>
  <ClipboardIcon {color} />
</button>
