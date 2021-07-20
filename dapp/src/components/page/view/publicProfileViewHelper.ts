export const publicProfileView = (claim): String | Boolean => {
    if(claim.type == "discord") return claim.draft.handle;
    return false
}