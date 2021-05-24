<style>
  .table-font {
    color: white;
  }
</style>

<script lang="ts">
  import { Link } from 'svelte-navigator';
</script>

<div class="table-font">
  <h1>Twitter Verification Public Tweet :: tweetId</h1>
  <!-- TODO Link internally -->
  <div class="px-2">
    <p>
      <b>tweetId</b> is a property of
      <Link to="/TwitterVerificationPublicTweet"
        >Twitter Verification Public Tweet</Link
      >
    </p>
    <p>
      It represents the tweetId number (as text) of the tweet containing a
      cryptographic signature
    </p>
    <p>
      Expected to have the value of <a href="https://schema.org/Text">Text</a>
    </p>
  </div>
</div>
