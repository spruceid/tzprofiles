<script lang="ts">
  import { Modal } from 'components';
  import { explainerInstance } from 'src/store';
  let textAreaValue = '';
  export let toggle;
  export let signature: string | Promise<string> | (() => Promise<any>) = '';
</script>

<Modal
  bind:toggle
  onToggle={async () => {
    textAreaValue =
      typeof signature === 'function' ? await signature() : await signature;
  }}
>
  <div slot="title" class="text-gray-650 text-center w-full">
    <h3>What am I signing?</h3>
  </div>
  <div
    slot="body"
    class="text-gray-650 overflow-y-auto px-6 my-6 w-full flex flex-col h-full"
  >
    <iframe
      class="h-full"
      src="{explainerInstance}/#!{textAreaValue}"
      title="Explainer Tool"
    />
  </div>
</Modal>
