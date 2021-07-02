<script lang="ts">
  import '../../common/style/typography.scss';

  let clazz: string = '';
  export { clazz as class };
  export let value: string;
</script>

<p class={clazz + ' lg:text-2xl sm:text-1xl text-md body'}>
  {value}
</p>
