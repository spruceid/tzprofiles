<style>
  .table-font {
    color: white;
  }
</style>

<script lang="ts">
  import { Link } from 'svelte-navigator';
</script>

<div class="table-font">
  <h1>GitHub Verification Message</h1>
  <p>Gist based verification for tzprofiles</p>
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
        The GitHub handle of the public gist and associate account.
      </td>
    </tr>
    <tr>
      <td class="border px-4 py-2">
        <Link to="/timestamp">timestamp</Link>
      </td>
      <td class="border px-4 py-2">
        <a href="http://www.w3.org/2001/XMLSchema#dateTime">Datetime</a>
      </td>
      <td class="border px-4 py-2"> The datetime of the public gist. </td>
    </tr>
    <tr>
      <td class="border px-4 py-2">
        <Link to="/gistId">gistId</Link>
      </td>
      <td class="border px-4 py-2">
        <a href="https://schema.org/Text">Text</a>
      </td>
      <td class="border px-4 py-2">
        The gistId number (in text) of the public gist signed by the
        associated profile's wallet key.
      </td>
    </tr>
    <tr>
      <td class="border px-4 py-2">
        <Link to="/gistVersion">gistVersion</Link>
      </td>
      <td class="border px-4 py-2">
        <a href="https://schema.org/Text">Text</a>
      </td>
      <td class="border px-4 py-2">
        The gist's witnessed version number (in text) of the public gist signed by the
        associated profile's wallet key.
      </td>
    </tr>

  </table>
</div>
