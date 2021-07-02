<style>
  .bg {
    position: absolute;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    background-color: rgba(5, 5, 5, 0.5);
    z-index: 9;
  }

  .modal-container {
    background-color: white;
    z-index: 10;
    position: absolute;
    min-width: 500px;
    padding: 24px;
    border-radius: 12px;
    left: calc(50% - 250px);
    right: 50%;
    top: 100px;
    max-height: 80vh;
    overflow: auto;
  }
</style>

<script lang="ts">
  import { PrimaryButton } from 'components';
  import { CloseIcon } from 'components/icons';

  export let onClose: () => void;
</script>

<div class="bg fade-in">
  <div class="modal-container">
    <div
      class="primary cursor-pointer text-bold mb-4 inline-block"
      on:click={() => onClose()}
    >
      <CloseIcon class="fill-current h-6 w-6" />
    </div>
    <slot />
  </div>
</div>
