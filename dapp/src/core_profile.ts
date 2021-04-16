import { v4 as uuid } from 'uuid';
import { alert, dappUrl } from 'src/store';
import { signClaim } from 'src/utils';
import { RequestSignPayloadInput, SigningType } from '@airgap/beacon-sdk';

export const signCoreProfile = async (
  userData,
  wallet,
  networkStr,
  DIDKit,
  profile
) => {
  try {
    const { alias, description, logo } = profile;
    const did = `did:pkh:tz:${userData.account.address}`;
    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        {
          alias: 'https://schema.org/name',
          description: 'https://schema.org/description',
          logo: 'https://schema.org/logo',
          CoreProfile: 'https://tzprofiles.me/CoreProfile'
        }
      ],
      id: 'urn:uuid:' + uuid(),
      issuer: did,
      issuanceDate: new Date().toISOString(),
      type: ['VerifiableCredential', 'CoreProfile'],
      credentialSubject: {
        id: did,
        alias,
        description,
        logo,
      },
    };

    let credentialString = JSON.stringify(credential);
    const proofOptions = {
      verificationMethod: did + '#TezosMethod2021',
      proofPurpose: 'assertionMethod',
    };

    const publicKey = userData.account.publicKey;
    const publicKeyJwkString = await DIDKit.JWKFromTezos(publicKey);
    let prepStr = await DIDKit.prepareIssueCredential(
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

    const payload: RequestSignPayloadInput = {
      signingType: SigningType.MICHELINE,
      payload: micheline,
      sourceAddress: userData.account.address,
    };
    const { signature } = await wallet.client.requestSignPayload(payload);

    let vcStr = await DIDKit.completeIssueCredential(
      credentialString,
      prepStr,
      signature
    );

    const verifyOptionsString = '{}';
    const verifyResult = JSON.parse(
      await DIDKit.verifyCredential(vcStr, verifyOptionsString)
    );
    if (verifyResult.errors.length > 0) {
      const errorMessage = `Unable to verify credential: ${verifyResult}`;
      alert.set({
        message: errorMessage,
        variant: 'error',
      });
      throw new Error(errorMessage);
    }

    alert.set({
      message: "You've completed your Core Profile successfully!",
      variant: 'success',
    });

    return vcStr;
  } catch (e) {
    alert.set({
      message: e,
      variant: 'error',
    });
    throw e;
  }
};
