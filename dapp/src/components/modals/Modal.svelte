<script lang="ts">
  import { CloseIcon } from 'components';
  export function toggle() {
    setTimeout(() => {
      opacity = !opacity;
      setTimeout(() => (hidden = !hidden), 200);
    });
    onToggle();
  }
  export let onToggle = () => {};
  export let backgroundColor: string = 'bg-white';

  let opacity = true;
  let hidden = false;
</script>

<div
  class="fixed z-10 inset-0"
  aria-labelledby="modal-title"
  role="dialog"
  aria-modal="true"
  class:hidden={opacity}
>
  <div
    class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center
    sm:block sm:p-0 h-full"
  >
    <div
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity
      duration-200"
      class:opacity-0={opacity}
      class:opacity-100={!opacity}
      aria-hidden="true"
      on:click={toggle}
    />
    <span
      class="hidden sm:inline-block sm:align-middle sm:h-screen"
      aria-hidden="true">&#8203;</span
    >
    <div
      class="inline-block align-bottom bg-white rounded-lg text-left
      shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl
      md:max-w-2xl lg:max-w-4xl xl:max-w-7xl sm:w-full max-h-5/6 overflow-hidden h-full"
      class:opacity-100={!opacity}
      class:translate-y-0={!opacity}
      class:sm:scale-100={!opacity}
      class:opacity-0={opacity}
      class:translate-y-4={opacity}
      class:sm:translate-y-0={opacity}
      class:sm:scale-95={opacity}
    >
      <div class={`${backgroundColor} py-6 h-full`}>
        <div class="flex flex-col sm:items-start h-full">
          <p on:click={toggle} class="underline pl-6 cursor-pointer text-black">
            <CloseIcon class="fill-current h-5 w-5" />
          </p>
          <slot id="modal-title" name="title" />
          <slot id="modal-body" name="body" />
          <div class="flex-grow" />
          <slot id="modal-footer" name="footer" />
        </div>
      </div>
    </div>
  </div>
</div>
