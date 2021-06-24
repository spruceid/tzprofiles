

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