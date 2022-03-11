<script lang="ts">
  import { CloseIcon } from 'components';
  import { alert } from 'src/store';
  import { onMount } from 'svelte';

  let resetTimeout: NodeJS.Timeout = null;
  let subscriptionTimeout: NodeJS.Timeout = null;
  let error: string = 'bg-red-100 border text-red-700';
  let warning: string = 'bg-orange-100 border text-orange-700';
  let success: string = 'bg-green-100 border text-green-700';
  let info: string = 'bg-blue-100 border text-blue-700';
  let style: string = '';
  let iconColor: string = '';
  let fade: boolean = false;

  const reset = () => {
    if (resetTimeout) clearTimeout(resetTimeout);
    fade = false;
    resetTimeout = setTimeout(() => alert.set(null), 500);
  };

  const updateStyle = () => {
    switch ($alert?.variant) {
      case 'error':
        style = error;
        iconColor = 'text-red-500';
        break;
      case 'warning':
        style = warning;
        iconColor = 'text-orange-500';
        break;
      case 'success':
        style = success;
        iconColor = 'text-green-500';
        break;
      case 'info':
        style = info;
        iconColor = 'text-blue-500';
        break;
      default:
        style = error;
        iconColor = 'text-red-500';
        break;
    }
  };

  onMount(() => {
    alert.subscribe((message) => {
      if (message) {
        updateStyle();
        fade = true;
        if (subscriptionTimeout) clearTimeout(subscriptionTimeout);
        subscriptionTimeout = setTimeout(() => {
          reset();
        }, 30000);
      }
    });
  });
</script>

<div
  class="pl-4 pr-8 py-3 rounded fixed top-10 inset-x-0 z-20 mx-auto max-w-4/5 lg:max-w-2/3 w-full transition-all ease-in-out duration-500 
  {style} "
  role="alert"
  class:opacity-0={!fade}
  class:hidden={!$alert?.message}
>
  <span
    class="block sm:inline pr-4 overflow-ellipsis overflow-hidden whitespace-nowrap"
    >{$alert?.message}</span
  >
  <span class="absolute top-0 bottom-0 right-0 px-4 py-3" on:click={reset}>
    <CloseIcon class="fill-current h-5 w-5 flex items-center justify-center {iconColor}" />
  </span>
</div>
