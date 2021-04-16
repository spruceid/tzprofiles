type hash = bytes;

type url = string;

type content_type = string;

type claim = (url, hash, content_type);

type storage = {
    owner    : address,
    metadata : big_map(string, bytes),
    claims   : set (claim)
};

// TODO: CHange to plural claim upload ?
let add_claim = ((u, h, c, s): (url, hash, content_type, storage)): storage => {
    {
        owner: s.owner,
        metadata: s.metadata,
        claims: Set.add((u, h, c), s.claims)
    };
};

let remove_claim = ((u, h, c, s): (url, hash, content_type, storage)): storage => {
    {
        owner: s.owner,
        metadata: s.metadata,
        claims: Set.remove((u, h, c), s.claims)
    };
};

type parameter = 
| AddClaim ((url, hash, content_type))
| RemoveClaim ((url, hash, content_type))
;
type return = (list (operation), storage);

let main = ((action, store): (parameter, storage)) : return => {
  if (Tezos.sender != store.owner) { failwith ("Unauthorized."); }; 
  switch (action) {
      | AddClaim (l) => ([]: list (operation), add_claim (l[0], l[1], l[2], store))
      | RemoveClaim (l) => ([]: list (operation), remove_claim (l[0], l[1], l[2], store))
  };
}
