import { NetworkType } from '@airgap/beacon-sdk';
import { util } from 'rebase/lib/util';
import type { Signer } from 'rebase/lib/hashref/storage/hash/tezos/tezos';
import { HashControl } from 'rebase/lib/hashref/client/provider/hashStorage';
import { ByOwnerHashControl, hashControlFromSigner } from 'rebase/lib/hashref/storage/hash/tezos/control/provider';
import { Storage } from 'rebase/lib/hashref/client/abstraction/storage';

import { contract } from './contract/contract';
import type {
  Hash,
  Ref,
  Location,
} from '../../storage';

import {
  fromRawStorage,
  hashViewer,
  screener,
  toStorage,
} from '../../storage';

const desync = util.default;

// TODO: Set
// const metadataUrl = '';
function operationCreate(storage: Storage<Hash, Ref>): Array<any> {
  return [toStorage(storage), true];
}

function operationRemove(storage: Storage<Hash, Ref>): Array<any> {
  return [toStorage(storage), false];
}

const operationsMap = {
  create: 'default',
  remove: 'default',
};

// TODO: Change LocationOpts to Network and derive the other two.
export default function toHashControl(
  metadataUrl: string,
  network: NetworkType,
  signer: Signer,
): Promise<ByOwnerHashControl<Hash, Ref>> {
  const config = {
    code: contract,
    hashViewer,
    network,
    metadataUrl,
    operations: operationsMap,
    screener,
    signer,
  };

  const fmt = {
    fromRawStorage: desync(fromRawStorage),
    toStorage: desync(toStorage),
    operations: {
      create: operationCreate,
      remove: operationRemove,
    },
  };

  return hashControlFromSigner(config, fmt);
}
