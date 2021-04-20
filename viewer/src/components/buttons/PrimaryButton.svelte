<script lang="ts">
  import { ButtonText } from 'components';
  let clazz: string = '';
  export { clazz as class };
  export let text: string;
  export let onClick: (() => void) | null;
  export let disabled: boolean = false;
  export let small: boolean = false;
</script>

<button
  {disabled}
  class={`shadow-xl bg-green-550 rounded-lg px-6 transition-all ease-in-out duration-500 ${clazz}`}
  class:py-4={!small}
  class:py-1={small}
  class:opacity-50={disabled}
  class:cursor-not-allowed={disabled}
  on:click|preventDefault={disabled ? null : onClick}
>
  <ButtonText value={text} />
</button>
