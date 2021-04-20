// TODO: Resotre when this no longer errs out as an unused var
// import type { BeaconWallet } from "@taquito/beacon-wallet";
import { InMemorySigner, importKey } from "@taquito/signer";
import * as taquito from "@taquito/taquito";
import { Wallet } from "@taquito/taquito";
import * as tzip16 from "@taquito/tzip16";
import { contract } from "../common";

const CONFIRMATION_CHECKS = 3;

interface SignerOpts {
  useWallet?: boolean;
  wallet?: any;
  useSecret?: boolean;
  secret?: string;
  useKeyFile?: boolean;
  key?: any;
}

// NOTE: hashFunc for the browser is currently unimplemented but would look like:
// async (claimBody) => {
// let encodedBody = new TextEncoder().encode(claimBody);
// await crypto.subtle.digest('SHA-256', encodedBody)
// }

// originate creates a new smart contract from a given wallet
// Returns nothing or throws an err
export async function originate(
  opts: SignerOpts,
  node_url: string,
  claim_urls: string[],
  verifyCredential: any,
  hashFunc: any,
  fetchFunc: any
): Promise<string> {
  try {
    const Tezos = new taquito.TezosToolkit(node_url);
    Tezos.addExtension(new tzip16.Tzip16Module());
    let pkHash;
    if (opts.useWallet) {
      Tezos.setWalletProvider(opts.wallet);
      pkHash = await opts.wallet.getPKH();
    } else if (opts.useSecret) {
      Tezos.setProvider({
        signer: new InMemorySigner(opts.secret),
      });
      pkHash = await Tezos.signer.publicKeyHash();
    } else if (opts.useKeyFile) {
      await importKey(
        Tezos,
        opts.key.email,
        opts.key.password,
        opts.key.mnemonic.join(" "),
        opts.key.secret
      );
      pkHash = await Tezos.signer.publicKeyHash();
    } else {
      throw new Error("No signing method found in opts");
    }

    let claims = [];
    for (let i = 0, x = claim_urls.length; i < x; i++) {
      let claim_url = claim_urls[i];
      let nextClaim = await url_to_entry(
        claim_url,
        verifyCredential,
        hashFunc,
        fetchFunc
      );
      claims.push(nextClaim);
    }

    const metadataBigMap = new taquito.MichelsonMap();
    metadataBigMap.set(
      "",
      tzip16.char2Bytes(
        "https://gist.githubusercontent.com/sbihel/a9273df118862acba2b4d15a8778e3dd/raw/0debf54a941fdda9cfde4d34866535d302856885/tpp-metadata.json"
      )
    );

    let originationOp, contractAddress;
    if (opts.useWallet) {
      let opSender = await Tezos.wallet.originate({
        code: contract,
        storage: {
          claims: claims,
          owner: pkHash,
          metadata: metadataBigMap,
        },
      });

      originationOp = await opSender.send();

      let c = await originationOp.contract();
      contractAddress = await c.address;
    } else {
      originationOp = await Tezos.contract.originate({
        code: contract,
        storage: {
          claims: claims,
          owner: pkHash,
          metadata: metadataBigMap,
        },
      });
      await originationOp.confirmation(CONFIRMATION_CHECKS);
      contractAddress = originationOp.contractAddress;
    }

    console.log(`Origination of ${contractAddress} Complete`);

    return contractAddress;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// add_entry takes a wallet, contract_address, and entry to store and called the add_entry
// command in the smart contract
export async function add_claim(
  opts: SignerOpts,
  contract_address: string,
  claim_url: string,
  node_url: string,
  verifyCredential: any,
  hashFunc: any,
  fetchFunc: any
) {
  try {
    const Tezos = new taquito.TezosToolkit(node_url);
    Tezos.addExtension(new tzip16.Tzip16Module());
    if (opts.useWallet) {
      Tezos.setWalletProvider(opts.wallet);
    } else if (opts.useSecret) {
      Tezos.setProvider({
        signer: new InMemorySigner(opts.secret),
      });
    } else if (opts.useKeyFile) {
      await importKey(
        Tezos,
        opts.key.email,
        opts.key.password,
        opts.key.mnemonic.join(" "),
        opts.key.secret
      );
    } else {
      throw new Error("No signing method found in opts");
    }

    let entry = await url_to_entry(
      claim_url,
      verifyCredential,
      hashFunc,
      fetchFunc
    );
    let contract = await Tezos.contract.at(contract_address);

    let op = await contract.methods.addClaim(entry).send();

    await op.confirmation(CONFIRMATION_CHECKS);

    let hash = op.hash;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function remove_claim(
  opts: SignerOpts,
  contract_address: string,
  claim_url: string,
  node_url: string,
  verifyCredential: any,
  hashFunc: any,
  fetchFunc: any
) {
  try {
    const Tezos = new taquito.TezosToolkit(node_url);
    Tezos.addExtension(new tzip16.Tzip16Module());
    if (opts.useWallet) {
      Tezos.setWalletProvider(opts.wallet);
    } else if (opts.useSecret) {
      Tezos.setProvider({
        signer: new InMemorySigner(opts.secret),
      });
    } else if (opts.useKeyFile) {
      await importKey(
        Tezos,
        opts.key.email,
        opts.key.password,
        opts.key.mnemonic.join(" "),
        opts.key.secret
      );
    } else {
      throw new Error("No signing method found in opts");
    }

    let entry = await url_to_entry(
      claim_url,
      verifyCredential,
      hashFunc,
      fetchFunc
    );
    let contract = await Tezos.contract.at(contract_address);

    let op = await contract.methods.removeClaim(entry).send();

    await op.confirmation(CONFIRMATION_CHECKS);
    let hash = op.hash;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function url_to_entry(
  claim_url: string,
  verifyCredential: any,
  hashFunc: any,
  fetchFunc: any
): Promise<[string, any, string]> {
  let claimRes = await fetchFunc(claim_url);
  let claimBody = await claimRes.text();

  // TODO: Restore once this actually works.
  // Validate VC
  // let verifyResult = await verifyCredential(claimBody, '{}');
  // let verifyJSON = JSON.parse(verifyResult);
  // if (verifyJSON.errors.length > 0) throw verifyJSON.errors;

  // Hash VC
  let vcHash = await hashFunc(claimBody);
  // let vcHash = await crypto.subtle.digest('SHA-256', encodedBody);
  let vcHashHex = Array.from(new Uint8Array(vcHash))
    .map((b) => ("00" + b.toString(16)).slice(-2))
    .join("");

  let claimJSON = JSON.parse(claimBody);

  let t = "VerifiableCredential";
  if (claimJSON.type && claimJSON.type.length && claimJSON.type.length > 0) {
    t = claimJSON.type[claimJSON.type.length - 1];
  }

  return [claim_url, vcHashHex, t];
}

// retrieve_tpp finds a smart contract from it's owner's
// returns an address if found, false if not, or throws and error if the network fails
export async function retrieve_tpp(
  bcd_url: string,
  address: string,
  network: string,
  fetchFunc: any
) {
  // TODO: Make version passable?
  let searchRes = await fetchFunc(
    `${bcd_url}/v1/search?q=${address}&n=${network}&i=contract`
  );
  if (!searchRes.ok || searchRes.status !== 200) {
    throw new Error(`Failed in explorer request: ${searchRes.statusText}`);
  }

  let searchJSON = await searchRes.json();
  if (searchJSON.count == 0) {
    return false;
  }

  for (var item of searchJSON.items) {
    if (item.type != "contract") {
      continue;
    }

    // TODO: Make this contract ID much more fool proof.
    if (
      item.body.entrypoints.includes("addClaim") &&
      item.body.entrypoints.includes("removeClaim")
    ) {
      return item.value;
    }
  }

  return false;
}

// retrieve_tpp's set of claims for a given wallet address
// returns an address if found, false if not, or throws and error if the network fails
export async function retrieve_tpp_claims(
  bcd_url: string,
  address: string,
  network: string,
  fetchFunc: any
) {
  let contractAddress = await retrieve_tpp(
    bcd_url,
    address,
    network,
    fetchFunc
  );
  if (!contractAddress) {
    return false;
  }

  // TODO: Make version passable?
  let storageRes = await fetchFunc(
    `${bcd_url}/v1/contract/${network}/${contractAddress}/storage`
  );
  let storageJSON = await storageRes.json();

  if (!validateStorage(storageJSON)) {
    throw new Error("Invalid storage, could not find list of triples");
  }

  let claimList = storageJSON.children[0].children;
  let tripleList = [];
  for (let i = 0, n = claimList.length; i < n; i++) {
    let claim = claimList[i];
    if (claim.children.length !== 3) {
      throw new Error("Invalid claim, was not a triple");
    }

    // TODO: Check hash here?
    let [urlWrapper, hashWrapper, typeWrapper] = claim.children;
    let nextTriple = [urlWrapper.value, hashWrapper.value, typeWrapper.value];
    tripleList.push(nextTriple);
  }

  return tripleList;
}

function validateStorage(s) {
  return (
    s &&
    s.children &&
    s.children.length &&
    s.children.length > 0 &&
    s.children[0].name === "claims" &&
    // TODO: Check if this will report an empty TPP contract as not existing?
    s.children[0]?.children
  );
}

// read_all lists all entries in the contract metadata
// export async function read_all(contract_address: string) {
// }
