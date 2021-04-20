<script lang="ts">
  import { CheckIcon } from 'components';
  export let step: number;
  export let currentStep: number;
  export let title: string;
  export let description: string;

  $: isFilled = step <= currentStep;
  $: isDone = step < currentStep;
</script>

<div
  class="flex mb-12 transition-all ease-in-out duration-500"
  class:opacity-50={!isFilled}
>
  <div
    class="inline-table w-8 h-8 rounded-full border-2 border-green-550 text-bold mr-4"
    class:bg-green-550={isFilled}
  >
    {#if isDone}
      <CheckIcon class="text-center" />
    {:else}
      <p class="text-sm my-1 mx-2 text-center font-bold">{step}</p>
    {/if}
  </div>
  <div class="flex flex-col overflow-hidden w-full">
    <h3 class="text-2xl text-left mb-2">{title}</h3>
    <p class="font-inter">{description}</p>
    <slot />
  </div>
</div>
