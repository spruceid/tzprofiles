<style>
  .bottom-full {
    bottom: 100%;
  }
</style>

<script lang="ts">
  export let tooltip: string = '';
  export let backgroundColor: string = 'bg-black';
  export let textColor: string = 'text-white';
  let clazz: string = '';
  export { clazz as class };
</script>

<div class="has-tooltip relative mx-2 {clazz}">
  <div
    class="{backgroundColor} {textColor} text-xs rounded py-1 px-4 bottom-full left-0 tooltip whitespace-nowrap"
  >
    {tooltip}
    <svg
      class="absolute {backgroundColor.replace(
        'bg',
        'text'
      )} h-2 left-0 ml-3 top-full"
      x="0px"
      y="0px"
      viewBox="0 0 255 255"
      xml:space="preserve"
    >
      <polygon class="fill-current" points="0,0 127.5,127.5 255,0" />
    </svg>
  </div>
  <slot />
</div>
