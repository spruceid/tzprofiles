export interface Twitter {
    // Allows for case switching against variant.
    type: 'twitter'
    handle: string,
    pubkey: string,
} 

export interface Discord {
    // Allows for case switching against variant.
    type: 'discord'
    handle: string,
    pubkey: string
}

export interface Dns {
    // Allows for case switching against variant.
    type: 'dns'
    domain: string,
    pubkey: string
}

export type variant = Twitter | Discord | Dns;

const fnMap = {
    'discord': (discord: Discord) => {
        return `I am attesting that this discord handle ${discord.handle} is linked to the Tezos account ${discord.pubkey} for tzprofiles\n\n`;
    },
    'twitter': (twitter: Twitter) => {
        return `I am attesting that this twitter handle @${twitter.handle} is linked to the Tezos account ${twitter.pubkey} for @tzprofiles\n\n`;
    },
    'dns': (dns: Dns) => {
        return `${dns.domain} is linked to ${dns.pubkey}`
    }
}

export function tzprofileChecker(variant: variant): string {
    let t = variant.type;
    switch (variant.type) {
        // Sadly, you can't be so clever as to fall through.
        case 'discord':
            return fnMap[variant.type](variant);
        case 'dns':
            return fnMap[variant.type](variant);
        case 'twitter':
            return fnMap[variant.type](variant);
        default:
            throw new Error(`Unkown variant: ${t}`)
    }
};

