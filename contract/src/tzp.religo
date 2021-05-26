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

let update = ((c, u, s): (list (claim), bool, storage)): storage => {
    let predicate = ((ss, cc) : (set (claim), claim)): set (claim) => Set.update(cc, u, ss);
    {
        owner: s.owner,
        contract_type: s.contract_type,
        metadata: s.metadata,
        claims: List.fold (predicate, c, s.claims)
    };
};

type parameter = 
| Update ((list (claim), bool))
;
type return = (list (operation), storage);

let main = ((action, store): (parameter, storage)) : return => {
  if (Tezos.sender != store.owner) { failwith ("Unauthorized."); }; 
  if (Tezos.amount > 0tz) { failwith ("Tez not accepted."); };
  switch (action) {
      | Update (l) => ([]: list (operation), update (l[0], l[1], store))
  };
}
