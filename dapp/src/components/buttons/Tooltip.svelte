<script lang="ts">
  export let tooltip: string = '';
  export { clazz as class };
  let clazz: string = '';
</script>

<div class={clazz} data-tooltip={tooltip}>
  <slot />
</div>
