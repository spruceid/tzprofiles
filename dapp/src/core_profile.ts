import { v4 as uuid } from 'uuid';
import { alert, dappUrl } from 'src/store';
import { signClaim } from 'src/utils';

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
        },
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
      verificationMethod: did + '#blockchainAccountId',
      proofPurpose: 'assertionMethod',
    };

    const keyType = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: 'Y-JndzKMXwcbIY9h0snDhFQZG0Weci9zfXHgeZTaMjo',
      d: 'tJ3uEI9_ymV3Yxk77ZKGcSOFO06j379ql8ZXJEuh6eM',
    };

    let prepStr = await DIDKit.prepareIssueCredential(
      credentialString,
      JSON.stringify(proofOptions),
      JSON.stringify(keyType)
    );

    const fmtInput = [
      'Tezos Signed Message: ',
      dappUrl,
      new Date().toISOString(),
      prepStr,
    ].join(' ');

    const signature = await signClaim(userData, fmtInput, wallet);

    let vcStr = await DIDKit.completeIssueCredential(
      credentialString,
      prepStr,
      signature
    );

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
