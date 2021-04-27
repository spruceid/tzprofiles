<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  html,
  body {
    position: relative;
    width: 100vw;
    min-height: 100vh;
    margin: 0px;
    padding: 0px;
    font-size: 16px;
    font-family: 'Inter';
    background: linear-gradient(151.67deg, #3a83a3 42.84%, #429383 103.49%);
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    font-family: 'Poppins';
    text-transform: capitalize;
    font-weight: 700;
    text-align: center;
  }

  td,
  th {
    font-family: 'Poppins';
    font-weight: 400;
  }

  pre {
    white-space: pre-wrap; /* Since CSS 2.1 */
    white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
    white-space: -pre-wrap; /* Opera 4-6 */
    white-space: -o-pre-wrap; /* Opera 7 */
    word-wrap: break-word; /* Internet Explorer 5.5+ */
  }

  /**
  Custom scrollbar settings
  */
  ::-webkit-scrollbar-track {
    border-radius: 8px;
    background-color: #ccc;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background-color: #888;
  }
  ::-webkit-scrollbar {
    height: 6px;
    border-radius: 8px;
    width: 6px;
    background-color: #ccc;
  }
</style>

<script lang="ts">
  import { Router, Route } from 'svelte-navigator';
  import { Home, View } from 'pages';

  //This avoids PurgeCSS from deleting classes from production build
  const classes: string =
    'py-4 py-1 opacity-50 cursor-not-allowed text-gray-350 text-gray-500 italic pl-6 bg-green-550 text-gray-370 opacity-0 opacity-60';
</script>

<Router>
  <Route path="/">
    <Home />
  </Route>
  <Route path="/view/:network/:address">
    <View />
  </Route>
  <Route path="/view/:address">
    <View />
  </Route>
</Router>
