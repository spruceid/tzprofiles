<style>
  .table-font {
    color: white;
  }
</style>

<script lang="ts">
  import { Link } from 'svelte-navigator';
</script>

<div class="table-font">
  <h1>Instagram Verification Public Post</h1>
  <p>Post caption based verification for tzprofiles</p>
  <table class="table-auto">
    <tr class="border">
      <th class="border"> Property </th>
      <th class="border"> Expected Type </th>
      <th class="border"> Description </th>
    </tr>
    <tr>
      <td class="border px-4 py-2">
        <Link to="/handle">handle</Link>
      </td>
      <td class="border px-4 py-2">
        <a href="https://schema.org/Text">Text</a>
      </td>
      <td class="border px-4 py-2">
        The Instagram handle of the public post and associate account.
      </td>
    </tr>
    <tr>
      <td class="border px-4 py-2">
        <Link to="/timestamp">timestamp</Link>
      </td>
      <td class="border px-4 py-2">
        <a href="http://www.w3.org/2001/XMLSchema#dateTime">Datetime</a>
      </td>
      <td class="border px-4 py-2"> The datetime of the public post. </td>
    </tr>
    <tr>
      <td class="border px-4 py-2">
        <Link to="/postUrl">postUrl</Link>
      </td>
      <td class="border px-4 py-2">
        <a href="https://schema.org/URL">URL</a>
      </td>
      <td class="border px-4 py-2">
        The url of the public post signed by the
        associated profile's wallet key.
      </td>
    </tr>
  </table>
</div>
