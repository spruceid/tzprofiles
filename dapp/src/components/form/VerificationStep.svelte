<script lang="ts">
  import { CheckIcon, SpinnerIcon, ErrorIcon } from 'components';
  export let step: number;
  export let currentStep: number;
  export let title: string;
  export let description: string = '';
  export let loading: boolean = false;
  export let error: boolean = false;

  $: isFilled = step <= currentStep;
  $: isDone = step < currentStep;
</script>

<div
  class="flex mb-12 transition-all ease-in-out duration-500 bg-white p-12 rounded-lg dropshadow-default"
  class:opacity-50={!isFilled}
>
  <div
    class="w-8 h-8 mr-4 border-2 rounded-full inline-table border-black text-bold"
    class:bg-black={isFilled}
  >
    {#if error}
      <ErrorIcon class="w-8 h-8 text-center" />
    {:else if loading}
      <SpinnerIcon class="w-8 h-8 text-center animate-spin" />
    {:else if isDone}
      <CheckIcon class="w-8 h-8 text-center" />
    {:else}
      <span class="w-8 h-8 p-2 text-sm font-bold text-center">{step}</span>
    {/if}
  </div>
  <div class="flex flex-col w-full overflow-hidden">
    <h3 class="mb-2 text-2xl text-left">{title}</h3>
    {#if description}
      <div class="font-inter body">{description}</div>
    {/if}
    <slot />
  </div>
</div>
