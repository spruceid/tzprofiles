<script lang="ts">
  import { SvelteComponentDev } from 'svelte/internal';

  export let title: string;
  export let description: string = '';
  export let icon: typeof SvelteComponentDev;
  export let iconColor: string = 'white';
  export { clazz as class };
  let clazz: string = '';
</script>

<div
  class="flex flex-col md:w-64 md:mx-12 lg:mx-28 xl:mx-32 mb-12 mx-4 {clazz}"
>
  <svelte:component this={icon} color={iconColor} class="w-1/3 m-auto" />
  <h3 class="my-4 text-2xl">{title}</h3>
  {#if description}
    <p class="text-sm text-center">{description}</p>
  {/if}
  <slot />
</div>
