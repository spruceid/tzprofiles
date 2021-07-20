import { v4 as uuid } from 'uuid';
import { alert } from 'src/store';
import { RequestSignPayloadInput, SigningType } from '@airgap/beacon-sdk';
import {
  completeIssueCredential,
  JWKFromTezos,
  prepareIssueCredential,
  verifyCredential,
} from 'didkit-wasm';

export const generateSignature = async (profile, userData) => {
  const { alias, description, website, logo } = profile;
  const did = `did:pkh:tz:${userData.account.address}`;
  const credential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      {
        alias: 'https://schema.org/name',
        description: 'https://schema.org/description',
        website: 'https://schema.org/url',
        logo: 'https://schema.org/logo',
        BasicProfile: 'https://tzprofiles.com/BasicProfile',
      },
    ],
    id: 'urn:uuid:' + uuid(),
    issuer: did,
    issuanceDate: new Date().toISOString(),
    type: ['VerifiableCredential', 'BasicProfile'],
    credentialSubject: {
      id: did,
      alias,
      description,
      website,
      logo,
    },
  };

  let credentialString = JSON.stringify(credential);
  const proofOptions = {
    verificationMethod: did + '#TezosMethod2021',
    proofPurpose: 'assertionMethod',
  };

  const publicKey = userData.account.publicKey;
  const publicKeyJwkString = await JWKFromTezos(publicKey);
  let prepStr = await prepareIssueCredential(
    credentialString,
    JSON.stringify(proofOptions),
    publicKeyJwkString
  );
  const preparation = JSON.parse(prepStr);
  const { signingInput } = preparation;
  const micheline = signingInput && signingInput.micheline;
  if (!micheline) {
    throw new Error('Expected micheline signing input');
  }
  return { micheline, credentialString, prepStr };
};

export const signBasicProfile = async (userData, wallet, profile) => {
  try {
    const { micheline, credentialString, prepStr } = await generateSignature(
      profile,
      userData
    );

    const payload: RequestSignPayloadInput = {
      signingType: SigningType.MICHELINE,
      payload: micheline,
      sourceAddress: userData.account.address,
    };
    const { signature } = await wallet.client.requestSignPayload(payload);

    let vcStr = await completeIssueCredential(
      credentialString,
      prepStr,
      signature
    );

    const verifyOptionsString = '{}';
    const verifyResult = JSON.parse(
      await verifyCredential(vcStr, verifyOptionsString)
    );
    if (verifyResult.errors.length > 0) {
      const errorMessage = `Unable to verify credential: ${verifyResult.errors.join(
        ', '
      )}`;
      alert.set({
        message: errorMessage,
        variant: 'error',
      });
      throw new Error(errorMessage);
    }

    alert.set({
      message: "You've completed your Basic Profile successfully!",
      variant: 'success',
    });

    return vcStr;
  } catch (e) {
    alert.set({
      message: e.message || JSON.stringify(e),
      variant: 'error',
    });
    throw e;
  }
};
