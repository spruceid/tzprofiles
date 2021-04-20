<script lang="ts">
  import { Nav, Footer, Alert } from 'components';
  let clazz: string;
  export { clazz as class };
</script>

<Nav />
<div class="flex flex-grow text-white 2xl:px-32 px-8 overflow-hidden-x {clazz}">
  <slot />
</div>
<Alert />
<Footer />
