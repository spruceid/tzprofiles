<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  .tooltip {
    @apply invisible absolute;
  }

  .has-tooltip:hover .tooltip {
    @apply visible z-50;
  }
  html,
  body {
    @apply relative bg-blue-light w-screen min-h-screen m-0 p-0 text-base flex font-inter flex-col overflow-x-hidden;
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    @apply font-inter font-semibold text-dark-1;
  }

  body {
    @apply text-dark-1;
  }

  a {
    @apply no-underline text-blue-1;
  }
  td,
  th {
    @apply font-inter font-normal;
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
    @apply rounded-lg bg-beige-1;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background-color: #888;
  }
  ::-webkit-scrollbar {
    @apply bg-beige-1 rounded-lg h-1.5 w-1.5;
  }
  .body1 {
    @apply text-xl;
  }
  .body2 {
    @apply text-base;
  }
</style>

<script lang="ts">
import { Router, Route } from 'svelte-navigator';
  import {
    Address,
    Connect,
    Ethereum,
    GistId,
    GistVersion,
    GitHub,
    GitHubVerification,
    GitHubVerificationMessage,
    Faq,
    Twitter,
    BasicProfile,
    TermsOfService,
    PrivacyPolicy,
    Deploy,
    Search,
    Splash,
    View,
    Handle,
    Timestamp,
    TweetId,
    BasicProfileContext,
    EthereumAddressControl,
    EthereumControl,
    Wallet,
    TwitterVerification,
    TwitterVerificationPublicTweet,
    DiscordVerification,
    DnsVerification,
  } from './routes';

  //This avoids PurgeCSS from deleting classes from production build
  const classes: string =
    'py-4 py-1 opacity-0 opacity-60 opacity-50 cursor-not-allowed text-gray-350\
     text-gray-500 hidden w-full w-80 italic pl-6 bg-green-550 text-gray-370 \
     opacity-100 translate-y-0 scale-100 translate-y-4 sm:translate-y-0 \
     sm:scale-95 lg:w-80';

  //Loads UserSnap when not in production
  if (BUILD_MODE_DEV) {
    (window as any).onUsersnapCXLoad = function (api) {
      api.init();
    };
    var script = document.createElement('script');
    script.defer = true;
    script.src =
      'https://widget.usersnap.com/global/load/da7045df-1276-4e2b-8260-c86e55f6e519?onload=onUsersnapCXLoad';
    document.getElementsByTagName('head')[0].appendChild(script);
  }
</script>

<Router>
  <Route path="/">
    <Splash />
  </Route>
  <Route path="/connect">
    <Connect />
  </Route>
  <Route path="faq">
    <Faq />
  </Route>
  <Route path="discord">
    <DiscordVerification />
  </Route>
  <Route path="dns">
    <DnsVerification />
  </Route>
  <Route path="twitter">
    <Twitter />
  </Route>
  <Route path="basic-profile">
    <BasicProfile />
  </Route>
  <Route path="ethereum">
    <Ethereum />
  </Route>
  <Route path="github">
    <GitHub />
  </Route>
  <Route path="terms-of-service">
    <TermsOfService />
  </Route>
  <Route path="privacy-policy">
    <PrivacyPolicy />
  </Route>
  <Route path="deploy">
    <Deploy />
  </Route>
  <Route path="search">
    <Search />
  </Route>
  <Route path="/view/:network/:address">
    <View />
  </Route>
  <Route path="/view/:address">
    <View />
  </Route>
  <Route path="BasicProfile">
    <BasicProfileContext />
  </Route>
  <Route path="GitHubVerification">
    <GitHubVerification />
  </Route>
  <Route path="GitHubVerificationMessage">
    <GitHubVerificationMessage />
  </Route>
  <Route path="TwitterVerification">
    <TwitterVerification />
  </Route>
  <Route path="TwitterVerificationPublicTweet">
    <TwitterVerificationPublicTweet />
  </Route>
  <Route path="handle">
    <Handle />
  </Route>
  <Route path="timestamp">
    <Timestamp />
  </Route>
  <Route path="tweetId">
    <TweetId />
  </Route>
  <Route path="gistId">
    <GistId />
  </Route>
  <Route path="gistVersion">
    <GistVersion />
  </Route>
  <Route path="EthereumAddressControl">
    <EthereumAddressControl />
  </Route>
  <Route path="ethereumWallet">
    <Address />
  </Route>
  <!-- NOTE: Eth claim backwards compat -->
  <Route path="EthereumControl">
    <EthereumControl />
  </Route>
  <Route path="ethereumWallet">
    <Wallet />
  </Route>
</Router>
