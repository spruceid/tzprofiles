const exhaustiveCheck = (arg: never) => {
  // Forces the type checker to complain if you've missed a sum type.
  // See https://dev.to/babak/exhaustive-type-checking-with-typescript-4l3f
}

export interface Subject<T> {
    type: T,
    id: string,
    key: string,
}

export type variant = 'discord' 
| 'dns'
| 'twitter'
| 'github';

export function makeAttestation(s: Subject<variant>): string {
    let t = s.type;
    switch (t) {
        case 'discord': 
            return `I am attesting that this discord handle ${s.id} is linked to the Tezos account ${s.key} for tzprofiles\n\n`;
        case 'dns': 
            return `${s.id} is linked to ${s.key}`
        case 'twitter':
            return `I am attesting that this twitter handle @${s.id} is linked to the Tezos account ${s.key} for @tzprofiles\n\n`;
        case 'github':
            return `I am attesting that this GitHub handle ${s.id} is linked to the Tezos account ${s.key} for tzprofiles\n\n`;
    }

    exhaustiveCheck(t);
    throw new Error(`Unknown type: ${t}`);
}
