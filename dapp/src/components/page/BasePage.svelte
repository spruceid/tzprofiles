<script lang="ts">
  import { Nav, Footer, Alert } from 'components';
  let clazz: string;
  // export let backHome: boolean = false;
  export { clazz as class };
</script>

<Nav />
<div class={clazz}>
  <slot />
  <!-- <Footer /> -->
</div>
<Alert />
