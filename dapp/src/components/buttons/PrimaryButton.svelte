<script lang="ts">
  import { ButtonText } from 'components';
  import './button.scss';

  let clazz: string = '';
  export { clazz as class };
  export let text: string;
  export let title: string = '';
  export let onClick: (() => void) | null;
  export let disabled: boolean = false;
  export let small: boolean = false;
</script>

<button
  {disabled}
  class={`${clazz} button-container`}
  class:py-4={!small}
  class:py-3={small}
  class:opacity-50={disabled}
  class:cursor-not-allowed={disabled}
  on:click|preventDefault={disabled ? null : onClick}
  aria-label={title}
  {title}
>
  <ButtonText value={text} />
</button>
