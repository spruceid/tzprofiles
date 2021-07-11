import { witnessUrl, alert } from 'src/store';

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
