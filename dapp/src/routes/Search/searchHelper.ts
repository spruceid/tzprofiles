import axios from 'axios';
import { alert } from 'src/store';

export const findAddressFromDomain = async (
  domain: string
): Promise<string> => {
  let searchParams =
    '{\n  domain(validity: VALID, name: ' +
    `"${domain}"` +
    ') {\n    owner\n  }\n}\n';

  const res = await axios.post(
    'https://api.tezos.domains/graphql',
    {
      operationName: null,
      variables: {},
      query: searchParams,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (res) {
    const { data } = res;
    if (!data.data.domain) {
      alert.set({
        message: `Please enter a valid address`,
        variant: 'error',
      });
      throw new Error(`No valid address found for ${domain}`);
    } else {
      return res.data.data.domain.owner;
    }
  }
};
