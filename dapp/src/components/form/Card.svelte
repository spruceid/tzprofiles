<script lang="ts">
  export { clazz as class };
  let clazz: string = '';
</script>

<div class="flex flex-col rounded-xl bg-white text-gray-650 {clazz}">
  <slot />
</div>
