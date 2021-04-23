<script lang="ts">
  import { onMount } from 'svelte';
  let clazz: string = '';
  export { clazz as class };
  export let name: string;
  export let placeholder: string = '';
  export let type: 'date' | 'text' | 'number' | 'checkbox' | 'email' = 'text';
  export let value: string = '';
  export let disabled: boolean = false;
  export let prefix: string = '';
  export let fluid: boolean = false;
  let inputElement;
  onMount(() => {
    inputElement.type = type;
  });
</script>

<div
  class="relative transition-all ease-in-out duration-500"
  class:w-full={fluid}
  class:opacity-60={disabled}
  class:cursor-not-allowed={disabled}
>
  {#if prefix}
    <span
      class="absolute py-3 text-xs left-2 leading-3"
      class:text-gray-350={!value}
      class:text-gray-500={value}
      class:cursor-not-allowed={disabled}
    >
      {prefix}
    </span>
  {/if}
  <input
    bind:this={inputElement}
    bind:value
    id={name}
    {name}
    {placeholder}
    class="flex w-full p-2 text-sm rounded-lg bg-transparent border border-green-550 focus:outline-green font-montserrat bg-white {clazz}"
    class:lg:w-80={!fluid}
    class:italic={!value}
    class:text-gray-350={!value}
    class:text-gray-500={value}
    class:pl-6={prefix}
    {disabled}
    readonly={disabled}
    class:cursor-not-allowed={disabled}
  />
</div>
