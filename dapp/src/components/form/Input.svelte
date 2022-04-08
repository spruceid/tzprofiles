<script lang="ts">
  import { onMount } from 'svelte';
  import './Input.scss';
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
  class="relative transition-all ease-in-out duration-500 flex flex-row items-center input-wrapper"
  class:w-full={fluid}
  class:opacity-60={disabled}
  class:cursor-not-allowed={disabled}
>
  {#if prefix}
    <span
      class="absolute text-sm left-2 leading-3 top-8"
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
    class="disabled:opacity-100 flex w-full py-3 px-4 text-sm rounded-lg focus:outline-none {clazz} body input-container h-12"
    class:lg:max-w-80={!fluid}
    class:text-gray-350={!value}
    class:pl-10={prefix}
    {disabled}
    readonly={disabled}
    class:cursor-not-allowed={disabled}
  />
</div>
