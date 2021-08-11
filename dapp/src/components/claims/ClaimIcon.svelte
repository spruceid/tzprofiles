<style>
  [data-tooltip] {
    position: relative;
    z-index: 2;
    display: block;
  }

  [data-tooltip]:before,
  [data-tooltip]:after {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    transition: 0.2s ease-out;
    transform: translate(-50%, 5px);
  }

  [data-tooltip]:before {
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-bottom: 5px;
    padding: 7px;
    width: 100%;
    min-width: 130px;
    max-width: 400px;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
    background-color: #000;
    background-color: hsla(0, 0%, 20%, 0.9);
    color: #fff;
    content: attr(data-tooltip);
    text-align: center;
    font-size: 14px;
    line-height: 1.2;
    transition: 0.2s ease-out;
  }

  [data-tooltip]:after {
    position: absolute;
    bottom: 100%;
    left: 50%;
    width: 0;
    border-top: 5px solid #000;
    border-top: 5px solid hsla(0, 0%, 20%, 0.9);
    border-right: 5px solid transparent;
    border-left: 5px solid transparent;
    content: ' ';
    font-size: 0;
    line-height: 0;
  }

  [data-tooltip]:hover:before,
  [data-tooltip]:hover:after {
    visibility: visible;
    opacity: 1;
    transform: translate(-50%, 0);
  }
  [data-tooltip='false']:hover:before,
  [data-tooltip='false']:hover:after {
    visibility: hidden;
    opacity: 0;
  }
</style>

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
