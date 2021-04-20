<script lang="ts">
  import { SvelteComponentDev } from 'svelte/internal';

  export let title: string;
  export let description: string;
  export let icon: typeof SvelteComponentDev;
  export let iconColor: string = 'white';
  export { clazz as class };
  let clazz: string = '';
</script>

<div
  class="flex flex-col md:w-64 md:mx-12 lg:mx-28 xl:mx-32 mb-12 mx-4 {clazz}"
>
  <svelte:component this={icon} color={iconColor} class="m-auto w-1/3" />
  <h3 class="text-2xl my-4">{title}</h3>
  <p class="text-sm text-center">{description}</p>
  <slot />
</div>
