<script lang="ts">
  let clazz: string = '';
  export { clazz as class };
  export let value: string;
</script>

<h5 class={`text-sm font-semibold text-white ${clazz}`}>
  {value}
</h5>
