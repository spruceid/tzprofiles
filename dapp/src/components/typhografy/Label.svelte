<script lang="ts">
  export let fieldName: string;
  export let value: string = '';
  export { clazz as class };
  let clazz: string = '';
</script>

<label
  for={fieldName}
  class="text-left font-monserrat text-sm mb-2 {clazz}"
  class:text-gray-370={!clazz}
>
  {value}
</label>
