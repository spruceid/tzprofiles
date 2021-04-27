type hash = bytes;

type url = string;

type content_type = string;

type claim = (url, hash, content_type);

type storage = {
    owner             : address,
    contract_type     : string,
    metadata          : big_map(string, bytes),
    claims            : set (claim)
};

let add_claims = ((c, s): (set (claim), storage)): storage => {
    let predicate = ((ss, cc) : (set (claim), claim)): set (claim) => Set.add(cc, ss);
    {
        owner: s.owner,
        contract_type: s.contract_type,
        metadata: s.metadata,
        claims: Set.fold (predicate, c, s.claims)
    };
};

let remove_claims = ((c, s): (set (claim), storage)): storage => {
    let predicate = ((ss, cc) : (set (claim), claim)): set (claim) => Set.remove(cc, ss);
    {
        owner: s.owner,
        contract_type: s.contract_type,
        metadata: s.metadata,
        claims: Set.fold (predicate, c, s.claims)
    };
};

type parameter = 
| AddClaims (set (claim))
| RemoveClaims (set (claim))
;
type return = (list (operation), storage);

let main = ((action, store): (parameter, storage)) : return => {
  if (Tezos.sender != store.owner) { failwith ("Unauthorized."); }; 
  switch (action) {
      | AddClaims (l) => ([]: list (operation), add_claims (l, store))
      | RemoveClaims (l) => ([]: list (operation), remove_claims (l, store))
  };
}
