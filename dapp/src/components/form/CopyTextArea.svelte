<script lang="ts">
  import { CopyButton } from 'components';
  export let value: string;
  export let fluid: boolean = false;
</script>

<div class="flex items-center w-full py-2" class:flex-grow={fluid}>
  <textarea
    class="overflow-x-auto rounded-lg bg-gray-650 p-2 mr-4 w-full resize-none text-white"
    bind:value
    class:h-full={fluid}
    readonly
    disabled
  />
  <CopyButton text={value} />
</div>
