import { witnessUrl, alert } from 'src/store';

export const verifyDnsInfo = async (domain: string, userData: any) => {
  try {
    const res: any = await fetch(
      `${witnessUrl}/dns_lookup?domain=${domain}&pk=${userData.account.publicKey}`
    );

    if (res.ok) {
      alert.set({
        message: "You've completed your DNS verification successfully!",
        variant: 'success',
      });

      let answerBody = await res.text();
      return JSON.parse(answerBody);
    }
    throw new Error(await res.text());
  } catch (err) {
    alert.set({
      message: err.message || JSON.stringify(err),
      variant: 'error',
    });

    throw err;
  }
};
