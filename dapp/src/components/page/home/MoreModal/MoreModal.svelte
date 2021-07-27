<script>
  import { EllipseIcon } from 'components';
  import { clickOutside } from './clickOutside.js';
  import './MoreModal.scss';

  export let onClickDelete;
  export let onClickDownload;

  let isOpen = false;

  const closePanel = () => {
    isOpen = false;
  };

  const openPanel = () => {
    isOpen = true;
  };

  const togglePanel = () => {
    isOpen = !isOpen;
  };
</script>

<div
  class="relative"
  use:clickOutside
  on:click_outside={() => {
    closePanel();
  }}
>
  <div
    class="cursor-pointer"
    on:click={() => {
      togglePanel();
    }}
  >
    <EllipseIcon />
  </div>
  {#if isOpen}
    <div class="panel-container">
      <div
        class="cursor-pointer"
        on:click={() => {
          closePanel();
          onClickDelete();
        }}
      >
        Delete
      </div>
    </div>
  {/if}
</div>
