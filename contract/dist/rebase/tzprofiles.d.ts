import type { BeaconWallet } from '@taquito/beacon-wallet';
import type { NetworkType } from '@airgap/beacon-sdk';
import { default as RebaseControlClient } from 'rebase/lib/hashref/client/ControlClient';
import { default as RebaseViewClient } from 'rebase/lib/hashref/client/ViewClient';
import { Content, Hash, Ref, Location } from './storage';
import { ByOwner } from 'rebase/lib/hashref/storage/hash/tezos/view/provider';
import { HashViewer } from 'rebase/lib/hashref/client/provider/hashStorage';
import { ByOwnerHashControl } from 'rebase/lib/hashref/storage/hash/tezos/control/provider';
import { Signer } from 'rebase/lib/hashref/storage/hash/tezos/tezos';
import { ContentViewer, ContentControl } from 'rebase/lib/hashref/client/provider/contentStorage';
import { ControlOpts } from 'rebase/lib/hashref/client/MultiClient';
import { Entry as RawEntry } from 'rebase/lib/hashref/client/abstraction/storage';
export declare type Entry = RawEntry<Content, Hash, Ref>;
export declare type ViewClient = RebaseViewClient<Content, Hash, Location, Ref>;
export declare class ControlClient extends RebaseControlClient<Content, Hash, Location, Ref> {
    constructor(hasher: (c: Content) => Promise<Hash>, contentControl: ContentControl<Content, Ref>, hashControl: ByOwnerHashControl<Hash, Ref>);
    getAddr(): string;
}
export declare function makeContentViewer(domain: string): ContentViewer<Content, Ref>;
export declare function makeHashViewer(searchAddress: string): HashViewer<Hash, Location, Ref>;
export declare type ViewClientOpts = {
    searchAddress: string;
    keplerDomain: string;
    network: NetworkType;
};
export declare function makeViewClient(opts: ViewClientOpts): ViewClient;
export declare function viewerOpts(network: NetworkType, ownerAddress: string): ByOwner;
export declare function makeContentControl(wallet: BeaconWallet, domain: string): Promise<ContentControl<Content, Ref>>;
export declare function makeHashControl(signer: Signer, network: NetworkType): Promise<ByOwnerHashControl<Hash, Ref>>;
export declare type ControlClientOpts = {
    keplerDomain: string;
    network: NetworkType;
    signer: BeaconWallet;
};
export declare function makeControlClient(opts: ControlClientOpts): Promise<ControlClient>;
export declare function makeControlOpts(opts: ControlClientOpts): Promise<ControlOpts<Content, Hash, Location, Ref>>;
