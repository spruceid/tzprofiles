<script lang="ts">
  import { LinkInput } from 'src/components';
  import type { ClaimUIAssets } from 'src/helpers';

  export let display: ClaimUIAssets;
</script>

<LinkInput href={display.route} source={display.routeDescription} />
