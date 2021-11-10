<script lang="ts">
  import { Alert, Nav } from 'components';
  let clazz: string;
  export { clazz as class };
</script>

<Nav />
<div class={clazz}>
  <slot />
  <!-- <Footer /> -->
</div>
<Alert />
