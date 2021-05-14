const contract = `{ parameter (pair (set (pair (pair string bytes) string)) bool) ;
  storage
    (pair (pair (set %claims (pair (pair string bytes) string)) (string %contract_type))
          (pair (big_map %metadata string bytes) (address %owner))) ;
  code { UNPAIR ;
         SWAP ;
         DUP ;
         DUG 2 ;
         CDR ;
         CDR ;
         SENDER ;
         COMPARE ;
         NEQ ;
         IF { PUSH string "Unauthorized." ; FAILWITH } {} ;
         UNPAIR ;
         DUP 3 ;
         CDR ;
         CDR ;
         DUP 4 ;
         CDR ;
         CAR ;
         PAIR ;
         DUP 4 ;
         CAR ;
         CDR ;
         DIG 4 ;
         CAR ;
         CAR ;
         DIG 3 ;
         ITER { SWAP ; DUP 5 ; DIG 2 ; UPDATE } ;
         DIG 3 ;
         DROP ;
         PAIR ;
         PAIR ;
         NIL operation ;
         PAIR } }`;


module.exports.contract = contract;
