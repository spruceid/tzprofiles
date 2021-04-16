<script lang="ts">
  let clazz: string = '';
  export { clazz as class };
  export let value: string;
</script>

<p class={clazz + ' text-base'}>
  {value}
</p>
