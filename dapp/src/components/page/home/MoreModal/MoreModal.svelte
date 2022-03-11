<script>
  import { EllipseIcon } from 'components';
  import { clickOutside } from './clickOutside.js';
  import './MoreModal.scss';

  export let onClickDelete;
  export let href;
  export let downloadFileName;

  let isOpen = false;

  const closePanel = () => {
    isOpen = false;
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
        class="cursor-pointer my-2 sm:my-3"
        on:click={() => {
          closePanel();
          onClickDelete();
        }}
      >
        Delete
      </div>

      <div class="cursor-pointer my-2 sm:my-3" on:click={() => closePanel()}>
        <a
          aria-label=""
          alt=""
          title=""
          {href}
          download={downloadFileName}
          class="text-black"
        >
          Download
        </a>
      </div>
    </div>
  {/if}
</div>
