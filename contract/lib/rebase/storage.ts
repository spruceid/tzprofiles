import { ByOwner, ownerViewer, metadataInterfaceScreener } from 'rebase/lib/hashref/storage/hash/tezos/view/provider';
import { Storage } from 'rebase/lib/hashref/client/abstraction/storage';

export type Hash = string;
export type Ref = string;

// TODO: Make VC type.
export type Content = {
  [index: string]: any;
};

export type Location = ByOwner;

export type StorageInput = Array<AppStorage>;
export type RawStorage = Array<ContractStorage>;

export type AppStorage = [Ref, Hash, 'VerifiableCredential'];
interface ContractStorage {
  children: [ Ref,  Hash, 'VerifiableCredential'];
}

export function fromRawStorage(raw: RawStorage): Storage<Hash, Ref> {
  return raw.map((x) => {
    return [x[1], x[0]];
  });
}

export function toStorage(storage: Storage<Hash, Ref>): StorageInput {
  return storage.map((x) => {
    const result: AppStorage = [x[1], x[0], 'VerifiableCredential'];
    return result;
  });
}

export const screener = metadataInterfaceScreener('TZIP-024');
export const hashViewer = ownerViewer('GetClaims', fromRawStorage, screener);
