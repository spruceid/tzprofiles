<script lang="ts">
  import { Modal } from 'components';
  import { CopyTextArea } from 'components';

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
  backgroundColor="bg-blue-550"
>
  <div slot="title" class="text-gray-650 text-center w-full">
    <h3>What am I signing?</h3>
  </div>
  <div
    slot="body"
    class="text-gray-650 overflow-y-auto px-6 my-6 w-full flex flex-col h-full"
  >
    <h2 class="normal-case">
      Copy the signature bellow and paste it in the
      <a
        target="_blank"
        href="https://explainer.spruceid.com"
        class="text-blue-400">Explainer Tool</a
      >
    </h2>
    <CopyTextArea bind:value={textAreaValue} fluid />
  </div>
</Modal>
