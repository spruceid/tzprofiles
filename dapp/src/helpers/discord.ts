import { witnessUrl, alert } from 'src/store';

export const validateDiscordHandle = (discordHandle: string): boolean => {
  if (discordHandle.length <= 5) return false;
};

export const discordMessageUrlToIds = (url: string): string[] => {
  const list = url.split('/');
  return [list[5], list[6]];
};

export const verifyDiscord = async (
  userData,
  discordHandle,
  discordMessageUrl,
) => {
  let [channelId, messageId] = discordMessageUrlToIds(discordMessageUrl);

  try {
    let res: any = await fetch(
      `${witnessUrl}/witness_discord?pk=${
        userData.account.publicKey
      }&channelId=${channelId}&messageId=${messageId}&discordHandle=${encodeURIComponent(discordHandle)}`
    );

    if (res.ok) {
      alert.set({
        message: "You've completed your Discord Profile successfully!",
        variant: 'success',
      });

      let answerBody = await res.text();
      return JSON.parse(answerBody);
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
