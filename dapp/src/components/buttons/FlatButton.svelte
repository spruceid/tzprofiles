<script lang="ts">
  let clazz: string = '';
  export { clazz as class };
  export let text: string;
  export let title: string = '';
  export let onClick: (() => void) | null;
  export let disabled: boolean = false;
</script>

<button
  {disabled}
  class={clazz}
  on:click|preventDefault={disabled ? null : onClick}
  aria-label={title}
  {title}
>
  <p>{text}</p>
</button>
