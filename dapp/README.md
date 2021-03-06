# Tezos Profiles

## Installation

For local deployment, you will need a local instance of
[Kepler](https://github.com/spruceid/kepler/) and the [Witness
worker](../worker).

If you want to use their production instances, you need to set the following
environment variables:
```bash
export KEPLER_URL=https://kepler.tzprofiles.com
export WITNESS_URL=https://witness.tzprofiles.com
```

To run:
```bash
npm install
npm run build
```
> For development purposes you can use `npm run dev`.

## Deployment
It is currently integrated with Cloudflare Pages. The `HEAD` of `main` is what
is available on tzprofiles.com -- and otherwise a specific deployment is
available for every commit of every branch.

## Add a new claim type:
Because the primary use-case of Tezos Profiles is the creation of a variety of claims, adding a new type of claim is easy and standardized:

### Part 1, the `src/helpers/claims.ts`:
* Add a new type `ClaimVCType`, this will be used as the final type in the produced Verifiable Credential, it is used by the UI to determine how to display / edit the VC's underlying data. Example: `BasicProfile`, `TwitterVerification`.
* Add a new `ClaimType`, this will be used in many switch statements to determine per-claim type specialized behavior, generate default draft structures for the end user to fill out, and use the static copy universal to all claims of that type. Example: `basic`, `twitter`
* Add an entry in `claimTypeFromVC` that translates from `ClaimVCType` to `ClaimType`
* Add a new type to `ClaimDraft`, this will represent the `draft` information of a Claim. This will be used to represent all claim specific information of a given claim, as opposed to `display` which is all data that is the same between claims of the same `ClaimType`. Example `BasicDraft`, `TwitterDraft`.
* Add a new claim draft `interface` corresponding to the `ClaimDraft` added in the previous type. Example:
```typescript
export interface BasicDraft {
  alias: string,
  description: string,
  logo: string
  website: string
}

export interface TwitterDraft {
  handle: string
  tweetUrl: string
}
```

At this point, the `claims.ts` file should be complaining about the `exhaustiveCheck` being hit by unaccounted for `ClaimType`s. To fix that:

* Add a result to `newDisplay` for the `ClaimType` added in the second step, this will be an implementation of the `ClaimUIAssets` type. This is used to to contain all components and copy that is universal between all claims of the same type. This allows the UI to be autogenerated and copy changes to only take place in one place. Example:
```javascript:
case 'twitter':
    return  {
        description: 'This process is used to link your Twitter account to your Tezos account by signing a message using your private key, entering your Twitter handle, and finally, tweeting that message.',
        display: 'Twitter Account Verification',
        icon: TwitterIcon,
        route: '/twitter',
        routeDescription: 'Twitter Account Information',
        proof: 'Tweet',
        title: 'Twitter Verification',
        type: 'Social Media',
    }
```

* Add a new result to `newDraft` which creates a `ClaimDraft` corresponding to the `ClaimType` added in the second step for when the user doesn't have a given claim. Example:
```javascript
case 'basic': 
    return {
        alias: '',
        description: '',
        logo: '',
        website: ''
    };

case 'twitter':
      return {
        handle: '',
        tweetUrl: ''
      };
```

* Develop the verifiable credential that will be created / signed. There is not a consistent place to use this, but knowing what it will look like is important. Examples found in `worker` or the `Ethereum` route.

* Add a result corresponding to the `ClaimType` created in the second step to `contentToDraft` which takes a `ClaimType` and VC and returns an appropriate draft:
```typescript
export const contentToDraft = (ct: ClaimType, content: any): ClaimDraft => {
  switch (ct) {
    case "basic": {
      const {credentialSubject} = content;
      const {alias, description, logo, website} = credentialSubject;

      return {
        alias,
        description,
        logo,
        website
      }
    }

    case "twitter": {
      const {evidence, credentialSubject} = content;
      const {sameAs} = credentialSubject;
      const {tweetId} = evidence;
      const handle = sameAs.replace('https://twitter.com/', '');
      const tweetUrl = `https://twitter.com/${handle}/status/${tweetId}`;

      return {
        handle,
        tweetUrl
      }
    }
  }

  exhaustiveCheck(ct);
}
```

* Add a result corresponding to the `ClaimType` created in the second step to `claimToOutlink` to be used in the Pubic View of the profile. Example:
```typescript
let draft = contentToDraft(c.type, c.content);

switch (ct) {
    case 'ethereum': {
      draft = draft as EthereumDraft;
      return `https://etherscan.io/address/${draft.address}`;
    }
    case 'twitter': {
        draft = draft as TwitterDraft;
        return `https://www.twitter.com/${draft.handle}`;
    }
}
```

### Part 1.5, Social Media Claims
Claim generation basically falls into 2 categories, the simpler version is internal to the site such as with the `basic` and `ethereum` claims, the more complex requires the `dapp` to reach out to a third party for some form of verification. The second category is referred to as `socialMediaClaimType`. If the claim being added requires external interaction, then the following will be needed to generate the claim creation and signing programattically:

* Add an entry to the `socialMediaClaimType`, Example `twitter`. This should be a subset of `ClaimType`.
* Add a result to `socialMediaTitle` corresponding to the `socialMediaClaimType`.
* Add a result to `socialMediaHandle` corresponding to the `socialMediaClaimType`.
* Add a result to `tzpHandle` corresponding to the `socialMediaClaimType`, this should be the handle of the Tezos Profile account associated with the platform.

### Part 2, add the UI components required by the other pages.
* Add a display component to `src/components/claims/display` which will be used when a user looks at their claim's details from their own profile. Should show all elements of the `claim.draft`.
* Add this component to the switch statement in `src/components/claims/display/ClaimsDisplay`.
* Add a component to `src/routes` for the end user to interact with to create (and in the future, update) the claim. This should make use of the `VerificationDescription` component (which because of the prior work, only needs to be passed the `claim.display` object to automatically render correctly) and the `VerificationStep` components for each step.
* If this is a `socialMediaClaimType`, use `getPreparedUnsignedMessage` to get the unsigned claim copy and following that, the `getFullSocialMediaClaim` to get the correctly formatted final post the user should make to the given platform.
* Add the bespoke verification logic.

Now, all of the UI "just works"!