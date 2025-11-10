<script lang="ts">
  import { claimToOutlink } from 'src/helpers';
  import { selectIconCopyText } from 'src/components/page/view/publicProfileViewHelper';
  import { CopyButton } from 'components';
  import type { Claim } from 'src/helpers';

  export let claim: Claim;
  export let tooltip: Boolean | String = false;

  const enableCopy = ['discord', 'dns'];
</script>

<a
  href={claimToOutlink(claim.type, claim)}
  target="_blank"
  data-tooltip={tooltip}
>
  <CopyButton
    text={selectIconCopyText(claim)}
    displayIcon={false}
    disabled={!enableCopy.includes(claim.type)}
    class="mr-2"
  >
    <div class="social-icon-container cursor-pointer">
      <svelte:component this={claim.display.icon} />
    </div>
  </CopyButton>
</a>
