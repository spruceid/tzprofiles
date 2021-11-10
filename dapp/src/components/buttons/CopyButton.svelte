<script lang="ts">
  import { onMount } from 'svelte';
  import { alert } from 'src/store';
  import { ClipboardIcon } from 'components';

  export let text: string | Promise<any> | (() => Promise<any>) = '';
  export let color: string = '#d1d1d1';
  export let displayIcon: boolean = true;
  export let disabled: boolean = false;
  export { clazz as class };
  let clazz: string = 'w-8 h-8';

  let copyToClipboard: () => void;

  onMount(() => {
    copyToClipboard = async () => {
      let copiedText;
      if (typeof text === 'function') {
        copiedText = await text();
      } else {
        copiedText = text;
      }
      navigator.clipboard.writeText(
        typeof text === 'function' ? await text() : await text
      );
      alert.set({
        variant: 'success',
        message: `Copied: ${copiedText.substring(0, 50)} ...`,
      });
    };
  });
</script>

<button
  aria-label="Copy to clipboard"
  title="Copy to clipboard"
  on:click={copyToClipboard}
  class={clazz}
  {disabled}
>
  {#if displayIcon}
    <div class="flex">
      <ClipboardIcon class={clazz} {color} />
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</button>
