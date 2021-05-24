<script lang="ts">
  import { onMount } from 'svelte';
  import { ClipboardIcon } from 'components';

  export let text: string | Promise<any> | (() => Promise<any>) = '';
  export let color: string = 'white';
  export { clazz as class };
  let clazz: string = 'w-8 h-8';

  let copyToClipboard: () => void;

  onMount(() => {
    copyToClipboard = async () =>
      navigator.clipboard.writeText(
        typeof text === 'function' ? await text() : await text
      );
  });
</script>

<button
  aria-label="Copy to clipboard"
  title="Copy to clipboard"
  on:click={copyToClipboard}
  class={clazz}
>
  <div class="flex">
    <ClipboardIcon class={clazz} {color} />
    <slot />
  </div>
</button>
