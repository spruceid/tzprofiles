import { witnessUrl, alert } from 'src/store';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { signClaim } from 'src/utils';

export const getTweetMessage = (userData, twitterHandle) => {
  return `I am attesting that this Twitter handle @${twitterHandle} is linked to the Tezos account ${userData.account.address} for @tzprofiles.`;
};

export const getTwitterClaim = async (userData, twitterHandle) => {
  try {
    const sig_target = getTweetMessage(userData, twitterHandle);
    return `Tezos Signed Message: ${sig_target}`;
  } catch (e) {
    alert.set({
      message: e.message || JSON.stringify(e),
      variant: 'error',
    });

    throw e;
  }
};

export const signTwitterClaim = async (
  userData,
  fmtInput: string,
  wallet: BeaconWallet
) => {
  try {
    const sig = await signClaim(userData, fmtInput, wallet);
    return `sig:${sig}`;
  } catch (e) {
    alert.set({
      message: e.message || JSON.stringify(e),
      variant: 'error',
    });

    throw e;
  }
};

const urlToTweetId = (url: string): string => {
  const list = url.split('/');
  const entry = list[list.length - 1];
  const entryList = entry.split('?');
  const innerEntry = entryList[0];
  const innerEntryList = innerEntry.split('#');
  return innerEntryList[0];
};

export const verifyTweet = async (userData, twitterHandle, tweetURL) => {
  let tweetID = urlToTweetId(tweetURL);
  try {
    let res = await fetch(
      `${witnessUrl}/witness_tweet?pk=${
        userData.account.publicKey
      }&handle=${twitterHandle.replace('@', '')}&tweet_id=${tweetID}`
    );

    if (res.ok) {
      alert.set({
        message: "You've completed your Twitter Profile successfully!",
        variant: 'success',
      });

      let temp = await res.text();

      return await res.text();
    }
    throw new Error(await res.text());
  } catch (e) {
    alert.set({
      message: e.message || JSON.stringify(e),
      variant: 'error',
    });

    throw e;
  }
};
