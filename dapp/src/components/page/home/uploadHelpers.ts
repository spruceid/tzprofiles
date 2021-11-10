import { ClaimMap, Claim } from 'src/helpers';
import { removeClaims, claimsStream, alert } from 'src/store';

export const canUpload = (claimStream: any): boolean => {
  let claims = Object.values(claimStream);
  for (let i = 0, n = claims.length; i < n; i++) {
    let claim: any = claims[i];
    if (claim.preparedContent) {
      return true;
    }
  }
  return false;
};

export const makeDownloadable = (obj: any): string => {
  let stringify = JSON.stringify(obj, null, 2);
  let encoded = encodeURIComponent(stringify);
  return `data:application/json;charset=utf-8,${encoded}`;
};

export const getCurrentOrbit = (cMap: ClaimMap) => {
  let keys = Object.keys(cMap);
  for (let i = 0, n = keys.length; i < n; i++) {
    let claim = cMap[keys[i]];
    if (claim.irl && claim.irl.startsWith('kepler')) {
      let irl = claim.irl;
      let prefixless = irl.slice(9);
      let orbitPath = prefixless.split('/');
      return orbitPath[0];
    }
  }
};

export const isAllOnChain = (cMap: ClaimMap): boolean => {
  let keys = Object.keys(cMap);
  let found = 0;
  for (let i = 0, n = keys.length; i < n; i++) {
    let claim = cMap[keys[i]];
    if (claim.onChain) {
      found++;
    }
  }

  return keys.length === found;
};

export const shouldDisplayPendingStatus = (claim): boolean => {
  return !claim.content && claim.preparedContent;
};

export const selectDisplayStatus = (claim): string => {
  if (!claim.content && claim.preparedContent) return 'Awaiting Upload';
  if (!claim.content && !claim.preparedContent) return 'incomplete';
  return 'complete';
};

export const statusTextToClassMapping = {
  'Awaiting Upload': 'pending',
  complete: 'complete',
  incomplete: 'incomplete',
};

const statusDisplayRanking = ['complete', 'pending', 'incomplete'];

export const sortClaimsByStatus = (a: Claim, b: Claim) => {
  let aRanking = statusDisplayRanking.indexOf(
    statusTextToClassMapping[selectDisplayStatus(a)]
  );
  let bRanking = statusDisplayRanking.indexOf(
    statusTextToClassMapping[selectDisplayStatus(b)]
  );

  if (aRanking < bRanking) {
    return -1;
  }
  if (aRanking > bRanking) {
    return 1;
  }
  return 0;
};

export const deleteSingleCredential = async (claim) => {
  await removeClaims([claim]);
  alert.set({
    message: 'Successfully removed credential',
    variant: 'success',
  });
};
