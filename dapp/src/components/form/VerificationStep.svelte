<style>
  .state-container {
    background-color: rgb(224, 224, 224);
  }

  .state-container-border {
    border: 1.5px solid rgb(224, 224, 224);
  }
</style>

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
  class="flex mb-4 transition-all ease-in-out duration-500 bg-white p-10 rounded-lg dropshadow-default"
  class:opacity-50={!isFilled}
>
  <div
    class="w-6 h-6 mr-4 rounded-full inline-table state-container-border text-bold"
    class:state-container={isFilled}
  >
    {#if error}
      <ErrorIcon class="w-6 h-6" />
    {:else if loading}
      <SpinnerIcon class="w-6 h-6 animate-spin" />
    {:else if isDone}
      <CheckIcon class="w-4 h-4" />
    {:else}
      <span class="w-6 h-6 p-2 text-sm font-bold text-center">{step}</span>
    {/if}
  </div>
  <div class="flex flex-col w-full overflow-visible mr-8">
    <div class="mb-4 text-2xl text-left font-bold body">{title}</div>
    {#if description}
      <div class="font-inter body">{description}</div>
    {/if}
    <slot />
  </div>
</div>
