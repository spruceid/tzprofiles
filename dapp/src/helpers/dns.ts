import { witnessUrl, alert } from 'src/store';

export const verifyDnsInfo = async (
  domain: string,
  userData: any,
  message: string
) => {
  try {
    const res: any = await fetch(
      `${witnessUrl}/witness_dns?domain=${domain}&pk=${userData.account.publicKey}&message=${message}`
    );

    if (res.ok) {
      alert.set({
        message: "You've completed your DNS verification successfully!",
        variant: 'success',
      });

      let data = await res.text();
      return JSON.parse(data);
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

export const isValidUrl = (str: string): boolean => {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  );
  return !!pattern.test(str);
};
