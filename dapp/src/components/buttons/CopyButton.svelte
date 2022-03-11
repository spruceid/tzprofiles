<script lang="ts">
  import { ClipboardIcon } from 'components';
  import { alert } from 'src/store';
  import { onMount, SvelteComponent } from 'svelte';

  export let icon: typeof SvelteComponent = null;
  export let text: string | Promise<any> | (() => Promise<any>) = '';
  export let color: string = '#d1d1d1';
  export let displayIcon: boolean = true;
  export let disabled: boolean = false;
  export { clazz as class };
  let clazz: string = 'w-6 sm:w-8 h-6 sm:h-8';

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
        message: `Copied: ${copiedText.substring(0, 50)}`,
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
      {#if !icon}
        <ClipboardIcon class={clazz} {color} />
      {:else}
        <svelte:component this={icon} {color} />
      {/if}
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</button>
