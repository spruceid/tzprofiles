<script lang="ts">
  export let value: any;
  export let selected: boolean = false;
  export let text: string = '';
</script>

<option {value} {selected}>{text}</option>
