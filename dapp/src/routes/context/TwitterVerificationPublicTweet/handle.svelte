<style>
  .table-font {
    color: white;
  }
</style>

<script lang="ts">
  import { Link } from 'svelte-navigator';
</script>

<div class="table-font">
  <h1>GitHub Verification Message :: handle</h1>
  <h1>Twitter Verification Public Tweet :: handle</h1>
  <div class="px-2">
    <p>
      <b>handle</b> is a property of
      <Link to="/TwitterVerificationPublicTweet"
        >Twitter Verification Public Tweet</Link
      >

      <Link to="/GitHubVerificationMessage"
        >GitHub Verification Message</Link
      >
    </p>
    <p>
      It represents the handle of a Twitter or Github account, without the leading '@'
    </p>
    <p>
      Expected to have the value of <a href="https://schema.org/Text">Text</a>
    </p>
  </div>
</div>
