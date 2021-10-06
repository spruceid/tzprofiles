import { Content, Hash, Ref, Location, RawStorage } from '../../storage';
import { HashViewer } from 'rebase/lib/hashref/client/provider/hashStorage';
import { Storage } from 'rebase/lib/hashref/client/abstraction/storage';
import { Screener } from 'rebase/lib/hashref/storage/hash/tezos/view/provider';
import { ContentViewer } from 'rebase/lib/hashref/client/provider/contentStorage';
export declare type IndexerResult = {
    address: string;
    valid: Array<[Ref, Content, string]>;
    invalid: Array<[Ref, Hash, string, Content, Error]>;
};
export declare function storageFromIndexer(iRes: IndexerResult): Promise<Array<Storage<Hash, Ref>>>;
export declare function toContentViewer(): ContentViewer<Content, Ref>;
export declare function toHashViewer(searchAddress: string, contractOperation: string, fmt: (r: RawStorage) => Storage<Hash, Ref>, screener: Screener): HashViewer<Hash, Location, Ref>;
