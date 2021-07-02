<script lang="ts">
  import './select.scss';

  export let value: any;
  export let id: string = '';
  export let name: string = '';
  export let onChange: (
    event: Event & {
      currentTarget: EventTarget & HTMLSelectElement;
    }
  ) => void;
  export { clazz as class };
  let clazz: string = '';
</script>

<!-- see https://github.com/sveltejs/svelte/issues/4946 for the warning -->
<!-- svelte-ignore a11y-no-onchange -->
<select
  {name}
  {id}
  class="select-container {clazz}"
  bind:value
  on:change={(e) => onChange(e)}
>
  <slot />
</select>
