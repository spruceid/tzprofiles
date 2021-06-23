<script lang="ts">
  let clazz: string = '';
  export { clazz as class };
  export let color: string = 'black';
</script>

<svg class={clazz} viewBox="0 0 24 24">
  <path
    d="M19 12H5"
    stroke={color}
    fill="transparent"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M12 19L5 12L12 5"
    stroke={color}
    fill="transparent"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
