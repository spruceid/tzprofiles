import { NetworkType } from '@airgap/beacon-sdk';
import { util } from 'rebase/lib/util';
import type { Signer } from 'rebase/lib/hashref/storage/hash/tezos/tezos';
import { HashControl } from 'rebase/lib/hashref/client/provider/hashStorage';
import { ByOwnerHashControl, hashControlFromSigner } from 'rebase/lib/hashref/storage/hash/tezos/control/provider';
import { Storage } from 'rebase/lib/hashref/client/abstraction/storage';
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

function operationCreate(storage: Storage<Hash, Ref>): Array<any> {
  return toStorage(storage);
}

function operationRemove(storage: Storage<Hash, Ref>): Array<any> {
  return toStorage(storage);
}

const operationsMap = {
  create: 'addClaims',
  remove: 'removeClaims',
};

export default function toHashControl(
  metadataUrl: string,
  network: NetworkType,
  signer: Signer,
): Promise<ByOwnerHashControl<Hash, Ref>> {
  // We are not deploying new v0 contracts, so no code is given.
  const config = {
    code: '',
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
