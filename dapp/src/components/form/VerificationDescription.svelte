<script lang="ts">
  export let display: ClaimUIAssets;
  export let iconColor: string = 'black';

</script>

<div
  class="flex flex-col mb-4 transition-all ease-in-out duration-500 bg-white p-4 sm:p-10 rounded-lg dropshadow-default"
>
  <div
    class="mb-4 text-2xl text-left font-bold body flex flex-row lg:items-center"
  >
    <svelte:component this={display.icon} color={iconColor} class="h-6 w-6" />
    <div class="ml-3">{display.title}</div>
  </div>
  <div class="body">
    {display.description}
  </div>
</div>
