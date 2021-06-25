<script lang="ts">
  import { Link } from 'svelte-navigator';
  let clazz: string = '';
  export let source: string;
  export let href: string;

  export { clazz as class };
</script>

<div
  class="flex justify-center w-full p-2 text-sm rounded-lg bg-transparent border border-gray-200 focus:outline-green font-montserrat bg-white {clazz}"
>
  <span class="text-gray-550">
    {'Available in '}
    <Link to={href} class="underline">{source}</Link>
  </span>
</div>
