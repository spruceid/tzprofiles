import { witnessUrl, dappUrl, alert } from 'src/store';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { signClaim } from 'src/utils';

export const getTwitterClaim = async (userData, twitterHandle) => {
  try {
    const sig_target = await (
      await fetch(
        `${witnessUrl}/tweet_sig_target?pk=${userData.account.publicKey}&handle=${twitterHandle}`
      )
    ).text();
    console.log(`Signature target: ${sig_target}`);

    return [
      'Tezos Signed Message: ',
      dappUrl,
      new Date().toISOString(),
      sig_target,
    ].join(' ');
  } catch (e) {
    alert.set({
      message: e.message,
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
      message: e.message,
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
  console.log(
    `Would've exchanged ${tweetURL} and ${userData.account.address} for VC`
  );
  let tweetID = urlToTweetId(tweetURL);
  try {
    let res = await fetch(
      `${witnessUrl}/witness_tweet?pk=${
        userData.account.publicKey
      }&handle=${twitterHandle.replace('@', '')}&tweet_id=${tweetID}`
    );

    if (res.ok) {
      alert.set({
        message: 'Success!',
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
