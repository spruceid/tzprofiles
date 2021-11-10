<script lang="ts">
  let clazz: string = '';
  export { clazz as class };
  export let color: string = 'black';
</script>
<!-- NOTE: width, height set here to get around Safari bug with tailwind or SVGs?-->

<svg 
  viewBox="0 0 32 32"
  class={clazz}
  width="25"
  height="20"
>
  <path
    d="m 16.615931,24.214558 v 7.900001 l 9.799995,-13.775001 z m 9.424995,-8.425 L 16.615931,0.11455811 V 11.514558 Z m -9.424995,-3.375 v 9.725 l 9.349995,-5.475 z M 6.3659311,15.789558 15.790931,0.11455811 V 11.514558 Z m 9.4249999,-3.375 v 9.725 l -9.3749999,-5.475 z m -0.025,11.8 v 7.900001 L 5.9659311,18.339558 Z"
    id="path3761"
    fill={color}
  />
</svg>
