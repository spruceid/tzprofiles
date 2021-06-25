<script lang="ts">
  export let fieldName: string;
  export let value: string = '';
  export { clazz as class };
  let clazz: string = '';
</script>

<label
  for={fieldName}
  class="text-left text-sm mb-2 body opacity-50 {clazz}"
  class:text-gray-370={!clazz}
>
  {value}
</label>
