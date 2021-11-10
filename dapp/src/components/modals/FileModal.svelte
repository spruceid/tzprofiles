<style>
  .bg {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-color: rgba(5, 5, 5, 0.5);
  }

  .modal-container {
    background-color: white;
    max-height: 80vh;
    overflow: auto;
  }
</style>

<script lang="ts">
  import { CloseIcon } from 'components/icons';
  import { onMount } from 'svelte';

  export let onClose: () => void;
  let innerClose = () => {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';

    document.body.style.height = '100%';
    document.body.style["overflow-y"] = 'auto';
    document.body.style["padding-right"] = '0px';

    window.scrollTo(0, parseInt(scrollY || '0') * -1);
    onClose();
  };

  let onOpen = () => {
    // When the modal is shown, we want a fixed body
    document.body.style.position = 'fixed';
    document.body.style.top = `-${window.scrollY}px`;

    document.body.style.height = '100vh';
    document.body.style["overflow-y"] = 'hidden';
    document.body.style["padding-right"] = '15px'; /* Avoid width reflow */

    // When the modal is hidden, we want to remain at the top of the scroll position
    document.body.style.position = '';
    document.body.style.top = '';
  }

  onMount(onOpen);
</script>

<div class="bg fade-in fixed pin z-50 overflow-auto flex">
  <div class="modal-container relative p-8 bg-white w-full max-w-md m-auto flex-col flex">
    <div
      class="primary cursor-pointer text-bold mb-4 inline-block"
      on:click={() => innerClose()}
    >
      <CloseIcon class="fill-current h-6 w-6" />
    </div>
    <slot />
  </div>
</div>
