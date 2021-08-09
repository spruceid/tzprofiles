export const publicProfileViewTooltip = (claim): string | Boolean => {
  if (claim.type == 'discord') return `${claim.draft.handle}`;
  return false;
};

export const selectIconCopyText = (claim): string => {
  switch (claim.type) {
    case 'discord':
      return claim.draft.handle;
    case 'dns':
      return claim.draft.address;
    default:
      return '';
  }
};
