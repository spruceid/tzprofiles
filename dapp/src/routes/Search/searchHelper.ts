import { alert } from 'src/store';

export const findAddressFromDomain = async (
  domain: string
): Promise<string> => {
  try {
    let searchParams =
      '{\n  domain(validity: VALID, name: ' +
      `"${domain}"` +
      ') {\n    address\n  }\n}\n';

    const res = await fetch('https://api.tezos.domains/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: null,
        variables: {},
        query: searchParams,
      }),
    });

    const data = await res.json();
    if (!data.data.domain) {
      throw new Error(`No valid address found for ${domain}`);
    } else {
      return data.data.domain.address;
    }
  } catch (err) {
    throw new Error(`No valid address found for ${domain}`);
  }
};
