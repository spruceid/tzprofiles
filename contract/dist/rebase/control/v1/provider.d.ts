import { NetworkType } from '@airgap/beacon-sdk';
import type { Signer } from 'rebase/lib/hashref/storage/hash/tezos/tezos';
import { ByOwnerHashControl } from 'rebase/lib/hashref/storage/hash/tezos/control/provider';
import type { Hash, Ref } from '../../storage';
export default function toHashControl(metadataUrl: string, network: NetworkType, signer: Signer): Promise<ByOwnerHashControl<Hash, Ref>>;
