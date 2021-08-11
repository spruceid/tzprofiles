import { ByOwner } from 'rebase/lib/hashref/storage/hash/tezos/view/provider';
import { Storage } from 'rebase/lib/hashref/client/abstraction/storage';
export declare type Hash = string;
export declare type Ref = string;
export declare type Content = {
    [index: string]: any;
};
export declare type Location = ByOwner;
export declare type StorageInput = Array<AppStorage>;
export declare type RawStorage = Array<ContractStorage>;
export declare type AppStorage = [Ref, Hash, 'VerifiableCredential'];
interface ContractStorage {
    children: [Ref, Hash, 'VerifiableCredential'];
}
export declare function fromRawStorage(raw: RawStorage): Storage<Hash, Ref>;
export declare function toStorage(storage: Storage<Hash, Ref>): StorageInput;
export declare const screener: import("rebase/lib/hashref/storage/hash/tezos/view/provider").Screener;
export declare const hashViewer: import("rebase/lib/hashref/client/provider/hashStorage").HashViewer<string, ByOwner, string>;
export {};
