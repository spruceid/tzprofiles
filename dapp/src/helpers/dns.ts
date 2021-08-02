import { witnessUrl, alert } from 'src/store';

export const verifyDnsInfo = async (domain: string, signature) => {
  try {
    const res: any = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=txt&ct=application/dns-json`
    );
    const body = await res.text();
    let txtEntries = JSON.parse(body).Answer;
    if (txtEntries.length === 0) throw new Error('No TXT entries');

    for (let i = 0; i < txtEntries.length; i++) {
      if (txtEntries[i].data.includes(signature)) {
        alert.set({
          message: 'Signature matched',
          variant: 'success',
        });

        return true;
      }
    }

    alert.set({
      message: 'No signature found',
      variant: 'error',
    });

    return false;
  } catch (err) {
    console.log(err);
  }
};
