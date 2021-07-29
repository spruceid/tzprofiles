import SvelteComponentDev from '*.svelte';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { signClaim } from 'src/utils';
import {
  PersonOutlined,
  TwitterIcon,
  EthereumIcon,
  DiscordIcon,
  GlobeIcon,
} from 'components';
import * as tzp from 'tzprofiles';

// TODO: Move to store?
export const exhaustiveCheck = (arg: never) => {
  // Forces the type checker to complain if you've missed a sum type.
  // See https://dev.to/babak/exhaustive-type-checking-with-typescript-4l3f
};

// The types of claims supported by the UI.
export type ClaimType = 'basic' | 'twitter' | 'ethereum' | 'discord' | 'dns';

// NOTE: Ethereum backwards compatibility
export type ClaimVCType =
  | 'BasicProfile'
  | 'TwitterVerification'
  | 'EthereumControl'
  | 'EthereumAddressControl'
  | 'DiscordVerification'
  | 'DnsVerification';

// TODO: Type better? Define what VCs look like generically?
export const claimTypeFromVC = (vc: any): ClaimType | false => {
  if (!vc?.type || !Array.isArray(vc.type)) {
    return false;
  }

  for (let i = 0, n = vc.type.length; i < n; i++) {
    let type = vc.type[i] as ClaimVCType;

    switch (type) {
      case 'BasicProfile':
        return 'basic';
      // NOTE: Ethereum backwards compatibility
      case 'EthereumControl':
      case 'EthereumAddressControl':
        return 'ethereum';
      case 'TwitterVerification':
        return 'twitter';
      case 'DiscordVerification':
        return 'discord';
      case 'DnsVerification':
        return 'dns';
      default:
    }
  }

  return false;
};

// All of the claim types to allow searching for exisitence in a collection.
const claimTypes: Array<ClaimType> = [
  'basic',
  'twitter',
  'ethereum',
  'discord',
  'dns',
];

export interface BasicDraft {
  alias: string;
  description: string;
  logo: string;
  website: string;
}

export interface EthereumDraft {
  sameAs: string;
  address: string;
}

export interface TwitterDraft {
  handle: string;
  tweetUrl: string;
}

export interface DiscordDraft {
  handle: string;
}

export interface DnsDraft {
  address: string;
}

export type ClaimDraft =
  | BasicDraft
  | TwitterDraft
  | EthereumDraft
  | DiscordDraft
  | DnsDraft;

/*
 * UI Text & Assets
 */
export interface ClaimUIAssets {
  // Long form description of the claim creation process
  description: string;
  // Short form display text of the claim
  display: string;
  // Icon of the claim shown
  icon: typeof SvelteComponentDev;
  // Route of the create UI for the given claim
  route: string;
  // Description of route for the UI
  routeDescription: string;
  // Proof type of the claim
  proof: string;
  // Title of the claim in the UI
  title: string;
  // Type of the claim displayed to the user
  type: string;
}

export const newDisplay = (ct: ClaimType): ClaimUIAssets => {
  switch (ct) {
    case 'basic':
      return {
        description:
          'This process is used to generate some basic profile information about yourself by filling in an alias, description, and logo for your profile.',
        display: 'Basic Profile Information',
        icon: PersonOutlined,
        route: '/basic-profile',
        routeDescription: 'Basic Profile Information',
        proof: 'Self-Attestation',
        title: 'Basic Profile',
        type: 'Basic Profile',
      };
    case 'ethereum':
      return {
        description:
          'This process is used to link your Ethereum address to your Tezos account by connecting to MetaMask, signing using your Ethereum address, and finally receiving the verification.',
        display: 'Ethereum Address Ownership',
        icon: EthereumIcon,
        route: '/ethereum',
        routeDescription: 'Ethereum Address Ownership',
        proof: 'Address Signature',
        title: 'Ethereum Address Ownership',
        type: 'Address Ownership',
      };
    case 'twitter':
      return {
        description:
          'This process is used to link your Twitter account to your Tezos account by signing a message using your private key, entering your Twitter handle, and finally, tweeting that message.',
        display: 'Twitter Account Verification',
        icon: TwitterIcon,
        route: '/twitter',
        routeDescription: 'Twitter Account Information',
        proof: 'Tweet',
        title: 'Twitter Verification',
        type: 'Social Media',
      };
    case 'discord':
      return {
        description:
          'This process is used to link your Discord account to your Tezos account by signing a message using your private key, entering your Discord handle, and finally, sending that message in a channel.',
        display: 'Discord Account Verification',
        icon: DiscordIcon,
        route: '/discord',
        routeDescription: 'Discord Account Information',
        proof: 'Discord Message',
        title: 'Discord Verification',
        type: 'Social Media',
      };
    case 'dns':
      return {
        description:
          'This process is used to link your web domain to your Tezos account by entering your domain, signing a message using your private key, entering the information into the TXT, and finally retrieving that data to verify.',
        display: 'Domain Verification',
        icon: GlobeIcon,
        route: '/dns',
        routeDescription: 'Domain Ownership',
        proof: 'Dns Message',
        title: 'Dns Verification',
        type: 'Social Media',
      };
  }

  exhaustiveCheck(ct);
};

// Creates default empty draft for first time claim creation
export const newDraft = (ct: ClaimType): ClaimDraft => {
  switch (ct) {
    case 'basic':
      return {
        alias: '',
        description: '',
        logo: '',
        website: '',
      };
    case 'ethereum':
      return {
        address: '',
        sameAs: '',
      };

    case 'twitter':
      return {
        handle: '',
        tweetUrl: '',
      };
  }

  // exhaustiveCheck(ct);
};

export interface Claim {
  // the saved content from Kepler which the claim represents
  // TODO: Replace object with a sum type?
  content: object | false;

  contractType: tzp.ClaimType;

  // Text and images used to render the claim
  display: ClaimUIAssets;

  // The user supplied changes to the concept.
  // If content->draft !deepEquals draft, show create/update UI.
  draft: ClaimDraft;

  // The kepler reference to the existing claim, false when not saved to kepler.
  irl: string | false;

  // valid signed JSON VC
  // TODO: Use content's type if it gets more specific.
  preparedContent: object | false;

  // Is the claim saved to the chain?
  onChain: boolean;
  // Type of claim
  type: ClaimType;
}

export interface ClaimMap {
  [index: string]: Claim;
}

export const addDefaults = (cm: ClaimMap): ClaimMap => {
  for (let i = 0, n = claimTypes.length; i < n; i++) {
    let ct = claimTypes[i];
    if (!cm[ct]) {
      cm[ct] = newClaim(ct);
    }
  }

  return cm;
};

// TODO: Make contractType a parameter?
export const newClaim = (ct: ClaimType): Claim => {
  return {
    content: false,
    contractType: 'VerifiableCredential',
    display: newDisplay(ct),
    draft: newDraft(ct),
    preparedContent: false,
    onChain: false,
    type: ct,
    irl: false,
  };
};

// TODO: Replace any with more intelligent typing
export const contentToDraft = (ct: ClaimType, content: any): ClaimDraft => {
  switch (ct) {
    case 'basic': {
      const { credentialSubject } = content;
      const { alias, description, logo, website } = credentialSubject;

      return {
        alias,
        description,
        logo,
        website,
      };
    }
    case 'ethereum': {
      const { credentialSubject } = content;
      // NOTE: Ethereum backwards compat.
      const { address, wallet, sameAs } = credentialSubject;
      return {
        address: address || wallet,
        sameAs,
      };
    }
    case 'twitter': {
      const { evidence, credentialSubject } = content;
      const { sameAs } = credentialSubject;
      const { tweetId } = evidence;
      const handle = sameAs.replace('https://twitter.com/', '');
      const tweetUrl = `https://twitter.com/${handle}/status/${tweetId}`;

      return {
        handle,
        tweetUrl,
      };
    }
    case 'discord': {
      const { evidence } = content;

      return {
        handle: evidence.handle,
      };
    }
  }
};

export const claimToOutlink = (ct: ClaimType, c: Claim): string => {
  if (!c.content) {
    throw new Error('Cannot make outlink without content');
  }

  if (c.type !== ct) {
    throw new Error('ClaimType must match claim');
  }

  let draft = contentToDraft(c.type, c.content);

  switch (ct) {
    case 'basic': {
      draft = draft as BasicDraft;
      return draft.website;
    }
    case 'ethereum': {
      draft = draft as EthereumDraft;
      return `https://etherscan.io/address/${draft.address}`;
    }
    case 'twitter': {
      draft = draft as TwitterDraft;
      return `https://www.twitter.com/${draft.handle}`;
    }
  }
};

// Create claim from a ClaimType and the result of tzprofilesClient's calls
export const claimFromTriple = (
  ct: ClaimType,
  triple: tzp.ValidContent<string, tzp.ClaimType, string>
): Claim => {
  let content = JSON.parse(triple[1]);
  return {
    content,
    contractType: triple[2],
    display: newDisplay(ct),
    draft: contentToDraft(ct, content),
    preparedContent: false,
    onChain: true,
    type: ct,
    irl: triple[0],
  };
};

// Check if user has unpersisted changes.
export const isUnsavedDraft = (c: Claim): boolean => {
  if (!c.content || c.preparedContent) {
    return true;
  }

  return deepEqual(c.draft, contentToDraft(c.type, c.content));
};

/*
 * Social Media Functions
 */

export type socialMediaClaimType = 'twitter' | 'discord';
// | "instagram"

const socialMediaTitle = (smType: socialMediaClaimType): string => {
  switch (smType) {
    case 'twitter':
      return 'Twitter';
    case 'discord':
      return 'Discord';
  }

  exhaustiveCheck(smType);
};

const socialMediaHandle = (
  smType: socialMediaClaimType,
  handle: string
): string => {
  switch (smType) {
    case 'twitter':
      return `@${handle}`;
    case 'discord':
      return `${handle}`;
  }

  exhaustiveCheck(smType);
};

const tzpHandle = (smType: socialMediaClaimType): string => {
  switch (smType) {
    case 'twitter':
      return socialMediaHandle(smType, 'tzprofiles');
    case 'discord':
      return socialMediaHandle(smType, 'tzprofiles');
  }

  exhaustiveCheck(smType);
};

export const getUnsignedMessage = (
  smType: socialMediaClaimType,
  // TODO: Type better
  userData: any,
  handle: string
): string => {
  let addr = userData?.account?.address;
  if (!addr) {
    throw new Error('Could not find Tezos address in user data');
  }

  return `I am attesting that this ${socialMediaTitle(
    smType
  )} handle ${socialMediaHandle(
    smType,
    handle
  )} is linked to the Tezos account ${addr} for ${tzpHandle(smType)}`;
};

export const getPreparedUnsignedMessage = (
  smType: socialMediaClaimType,
  // TODO: Type better
  userData: any,
  handle: string
): string => {
  return `Tezos Signed Message: ${getUnsignedMessage(
    smType,
    userData,
    handle
  )}`;
};

export const getSignedClaim = async (
  smType: socialMediaClaimType,
  // TODO: Type better
  userData: any,
  handle: string,
  wallet: BeaconWallet
): Promise<string> => {
  const msg = `${getPreparedUnsignedMessage(smType, userData, handle)}\n\n`;
  const sig = await signClaim(userData, msg, wallet);
  return `sig:${sig}`;
};

export const getFullSocialMediaClaim = async (
  smType: socialMediaClaimType,
  // TODO: Type better
  userData: any,
  handle: string,
  wallet: BeaconWallet
): Promise<string> => {
  return `${getUnsignedMessage(
    smType,
    userData,
    handle
  )}\n\n${await getSignedClaim(smType, userData, handle, wallet)}`;
};

/*
 * Things that should be built in
 */

// Because === is referential equality and JSON stringify mixes up keys.
const deepEqual = (object1: object, object2: object): boolean => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }

    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !deepEqual(val1, val2)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
};

const isObject = (object): boolean => {
  return object != null && typeof object === 'object';
};
