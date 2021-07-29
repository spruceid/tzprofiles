const { UDPClient } = require('dns2');

const resolve = UDPClient();

export const fetchDnsInfo = async (domain: string) => {
  try {
    console.log('Fetching DNS info');
    const result = await resolve(domain);
    console.log(result.answers);
  } catch (err) {
    console.log(err);
  }
};
