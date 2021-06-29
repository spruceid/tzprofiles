<style>
  .table-font {
    color: white;
  }
</style>

<script lang="ts">
  import { Link } from 'svelte-navigator';
</script>

<div class="table-font">
  <h1>Ethereum Address Control</h1>
  <p>Ethereum address control for tzprofiles</p>
  <table>
    <tr>
      <th class="border"> Property </th>
      <th class="border"> Expected Type </th>
      <th class="border"> Description </th>
    </tr>
    <tr>
      <td class="border px-4 py-2">
        <a href="https://schema.org/sameAs"> sameAs </a>
      </td>
      <td class="border px-4 py-2">
        <a href="https://schema.org/Text"> Text </a>
      </td>
      <td class="border px-4 py-2">
        The public key hash of the tezos account that controls the attested
        ethereum address. Matches the owner of the smart contract used to save
        the signed VC.
      </td>
    </tr>
    <tr>
      <td class="border px-4 py-2">
        <Link to="/ethereum-address">Address</Link>
      </td>
      <td class="border px-4 py-2">
        <a href="https://schema.org/Text"> Text </a>
      </td>
      <td class="border px-4 py-2">
        The public key hash of the ethereum address used to sign the VC.
      </td>
    </tr>
  </table>
</div>
