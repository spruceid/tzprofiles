

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