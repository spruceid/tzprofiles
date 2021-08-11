import * as taquito from '@taquito/taquito';
import * as tzip16 from '@taquito/tzip16';
import axios from 'axios';

import hasher from '../../hasher/hasher';
import {
  Content, Hash, Ref, Location, RawStorage,
} from '../../storage';

import { HashViewer } from 'rebase/lib/hashref/client/provider/hashStorage';
import { contractAddressesFromOwner } from 'rebase/lib/hashref/storage/hash/tezos/tezos';
import { Storage, StorageEntry } from 'rebase/lib/hashref/client/abstraction/storage';
import { Screener } from 'rebase/lib/hashref/storage/hash/tezos/view/provider';
import { ContentViewer } from 'rebase/lib/hashref/client/provider/contentStorage';
import { contentViewer } from 'rebase/lib/hashref/storage/content/kepler/view/provider';

const keplerBase = 'https://kepler.tzprofiles.com';

type IndexerRawResult = {
  data: {
    tzprofiles_by_pk: {
      contract: string;
      valid_claims: Array<[Ref, Content, string]>;
      invalid_claims: Array<[Ref, Hash, string, Content, Error]>;
    };
  };
};

export type IndexerResult = {
  address: string;
  // Reference, Content, ContentType
  valid: Array<[Ref, Content, string]>;
  // Reference, Hash, ContentType, Content, Error
  invalid: Array<[Ref, Hash, string, Content, Error]>;
};

export async function storageFromIndexer(
  iRes: IndexerResult,
): Promise<Array<Storage<Hash, Ref>>> {
  const s1: Storage<Hash, Ref> = await Promise.all(iRes.valid.map(async (x) => {
    const ref = x[0];
    const content = x[1];
    return [await hasher(content), ref] as StorageEntry<Hash, Ref>;
  }));

  const s2: Storage<Hash, Ref> = iRes.invalid.map((x) => {
    const ref = x[0];
    const hash = x[1];
    return [hash, ref] as StorageEntry<Hash, Ref>;
  });

  return [s1.concat(s2)];
}

export function toContentViewer(): ContentViewer<Content, Ref> {
  const f = contentViewer(keplerBase);
  return async (ref: Ref) => {
    const s = await f(ref);
    return JSON.parse(s) as Content;
  };
}

// This configures a PublicClient which screens for a given owners contracts for
// a specific one given by the screener.
export function toHashViewer(
  // TODO: This var is used to be set by the hash viewer. Instead, make storage have a "data" result as well.
  // TODO: Replace with handling of multiple contracts.
  searchAddress: string,
  contractOperation: string,
  fmt: (r: RawStorage) => Storage<Hash, Ref>,
  screener: Screener,
): HashViewer<Hash, Location, Ref> {
  return async (location: Location): Promise<Array<Storage<Hash, Ref>>> => {
    // TOOD: ADD BY INDEXER
    if (location.network === 'mainnet') {
      const body = {
        query: `query MyQuery { tzprofiles_by_pk(account: "${location.ownerAddress}") { invalid_claims valid_claims contract } }`,
        variables: null,
        operationName: 'MyQuery',
      };

      const res = await axios.post('https://indexer.tzprofiles.com/v1/graphql', body);
      const data = res.data as IndexerRawResult;
      if (!data) {
        throw new Error('No data found from indexer');
      }

      const base = data?.data?.tzprofiles_by_pk;
      if (!base) {
        throw new Error('Badly formatted data found from indexer');
      }

      const iRes = {
        address: base?.contract,
        valid: base?.valid_claims,
        invalid: base?.invalid_claims,
      };

      searchAddress = iRes.address;
      return storageFromIndexer(iRes);
    }

    const tzKit = new taquito.TezosToolkit(location.nodeUrl);
    tzKit.addExtension(new tzip16.Tzip16Module());

    const addressList = await contractAddressesFromOwner(
      0,
      location.ownerAddress,
      location.tzktBase,
    );

    const storageList: Array<Storage<Hash, Ref>> = [];
    for (let i = 0, n = addressList.length; i < n; i += 1) {
      const address = addressList[i];

      // for now, agreeing to disagree with no await in a loop here.
      // TODO: something else?
      /* eslint-disable no-await-in-loop */
      if (address && await screener(address, tzKit, false)) {
        searchAddress = address;
        const contract = await tzKit.contract.at(address, tzip16.tzip16);
        const views = await contract.tzip16().metadataViews();
        const op = views[contractOperation];
        if (!op) {
          // be more descriptive?
          throw new Error('Could not read storage for contract ${}');
        }

        storageList.push(fmt(await op().executeView() as RawStorage));
      }
    }

    return storageList;
  };
}
