import * as taquito from '@taquito/taquito';
import * as tzip16 from '@taquito/tzip16';
import type { BeaconWallet } from '@taquito/beacon-wallet';
import type {NetworkType} from '@airgap/beacon-sdk';

import * as v0Auth from './control/v0/provider';
import * as v1Auth from './control/v1/provider';

import { default as RebaseControlClient } from 'rebase/lib/hashref/client/ControlClient';
import { default as RebaseViewClient } from 'rebase/lib/hashref/client/ViewClient';

import {
  Content, Hash, Ref, Location, fromRawStorage, screener,
} from './storage';

import hasher from './hasher/hasher';

import { ByOwner } from 'rebase/lib/hashref/storage/hash/tezos/view/provider';
import { HashControl, HashViewer } from 'rebase/lib/hashref/client/provider/hashStorage';
import { ByOwnerHashControl, locationOptsFromNetwork } from 'rebase/lib/hashref/storage/hash/tezos/control/provider';
import {
  contractAddressesFromOwner, loadSigner, Signer, TQContract,
} from 'rebase/lib/hashref/storage/hash/tezos/tezos';
import { toHashViewer } from './view/v0/provider';

import { ContentViewer, ContentControl } from 'rebase/lib/hashref/client/provider/contentStorage';
import { contentViewer } from 'rebase/lib/hashref/storage/content/kepler/view/provider';
import { contentControl } from 'rebase/lib/hashref/storage/content/kepler/control/tezos/provider';
import { ControlOpts } from 'rebase/lib/hashref/client/MultiClient';

import {Entry as RawEntry} from 'rebase/lib/hashref/client/abstraction/storage';

export type Entry = RawEntry<Content, Hash, Ref>;
export type ViewClient = RebaseViewClient<Content, Hash, Location, Ref>;
export class ControlClient extends RebaseControlClient<Content, Hash, Location, Ref> {
  constructor(
    hasher: (c: Content) => Promise<Hash>,
    contentControl: ContentControl<Content, Ref>,
    hashControl: ByOwnerHashControl<Hash, Ref>,
  ) {
    super(
      hasher,
      contentControl,
      hashControl
    );
  }

  getAddr() {
    let x = this.hashControl as ByOwnerHashControl<Hash, Ref>;
    return x.contractAddr();
  }
}

const metadataUrl = 'https://tzprofiles.com/tzip016_metadata.json';

export function makeContentViewer(domain: string): ContentViewer<Content, Ref> {
  const f = contentViewer(domain);
  return async (ref: Ref) => JSON.parse(await f(ref)) as Content;
}

export function makeHashViewer(searchAddress: string): HashViewer<Hash, Location, Ref> {
  return toHashViewer(searchAddress, 'GetClaims', fromRawStorage, screener);
}

export type ViewClientOpts = {
  searchAddress: string;
  keplerDomain: string;
  network: NetworkType;
};

export function makeViewClient(opts: ViewClientOpts): ViewClient {
  return new RebaseViewClient(
    hasher,
    makeContentViewer(opts.keplerDomain),
    makeHashViewer(opts.searchAddress),
  );
}

export function viewerOpts(network: NetworkType, ownerAddress: string): ByOwner {
  let opts = locationOptsFromNetwork(network);
  return {
    network: opts.network,
    tzktBase: opts.tzktBase,
    nodeUrl: opts.nodeUrl,
    ownerAddress,
  }
}

// TODO: Accept Signer instead of BeaconWallet.
export async function makeContentControl(
  wallet: BeaconWallet,
  domain: string,
): Promise<ContentControl<Content, Ref>> {
  const client = await contentControl(wallet, domain);
  return {
    id: client.id,
    create: (contentList: Array<Content>): Promise<Array<Ref>> => {
      return client.create(contentList);
    },
    read: async (ref: Ref): Promise<Content> => {
      let result = JSON.parse(await client.read(ref)) as Content;
      return result;
    },
    remove: client.remove,
    update: async (newContentList: Array<Content>, oldRefList: Array<Ref>): Promise<Array<Ref>> => {
      if (client.update) {
        return await client.update(newContentList, oldRefList);
      }
      await client.remove(oldRefList);
      return client.create(newContentList);
    },
  };
}

export async function makeHashControl(
  signer: Signer,
  network: NetworkType,
): Promise<ByOwnerHashControl<Hash, Ref>> {
  const { nodeUrl, tzktBase } = locationOptsFromNetwork(network);
  const tzKit = new taquito.TezosToolkit(nodeUrl);
  tzKit.addExtension(new tzip16.Tzip16Module());
  await loadSigner(signer, tzKit);
  let pkh: string;
  const t = signer.type;
  switch (signer.type) {
    case 'key_file':
      pkh = await tzKit.signer.publicKeyHash();
      break;
    case 'secret':
      pkh = await tzKit.signer.publicKeyHash();
      break;
    case 'wallet':
      pkh = await signer.wallet.getPKH();
      break;
    default:
      throw new Error(`Unknown signer type ${t}`);
  }

  const addressList = await contractAddressesFromOwner(
    0,
    pkh,
    tzktBase,
  );

  let contract: TQContract | false = false;
  for (let i = 0, n = addressList.length; i < n; i += 1) {
    const address = addressList[i];
    if (address) {
      // for now, agreeing to disagree with no await in a loop here.
      // TODO: something else when supporting multicontract
      /* eslint-disable no-await-in-loop */
      contract = await screener(address, tzKit, signer.type === 'wallet');
      if (contract) {
        break;
      }
    }
  }

  if (!contract) {
    return v1Auth.default(metadataUrl, network, signer);
  }
  const entrypoints = Object.keys(contract.methods);
  if (entrypoints.length === 1 && entrypoints.includes('default')) {
    return v1Auth.default(metadataUrl, network, signer);
  }
  if (entrypoints.includes('addClaims') && entrypoints.includes('removeClaims')) {
    return v0Auth.default(metadataUrl, network, signer);
  }

  throw new Error('Contract found by screener did not match entrypoint expectations');
}

export type ControlClientOpts = {
  keplerDomain: string;
  network: NetworkType;
  // TODO: Accept all signers once working w/ Kepler.
  signer: BeaconWallet;
};

export async function makeControlClient(
  opts: ControlClientOpts,
): Promise<ControlClient> {
  return new ControlClient(
    hasher,
    await makeContentControl(opts.signer, opts.keplerDomain),
    await makeHashControl(
      { type: 'wallet', wallet: opts.signer },
      opts.network,
    ),
  );
}

export async function makeControlOpts(
  opts: ControlClientOpts,
): Promise<ControlOpts<Content, Hash, Location, Ref>> {
  const content = await makeContentControl(opts.signer, opts.keplerDomain);
  const hash = await makeHashControl(
    { type: 'wallet', wallet: opts.signer },
    opts.network,
  );

  const clientId = `${hash.id}::${content.id}`;
  return {
    clientId,
    hasher,
    contentControl: content,
    hashControl: hash,
  };
}
