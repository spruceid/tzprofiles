extern crate wasm_bindgen;

#[macro_use]
extern crate log;

mod twitter;
mod utils;

use anyhow::{anyhow, Result};
use chrono::Utc;
use did_pkh::DIDPKH;
use js_sys::Promise;
use serde_json::json;
use ssi::{
    blakesig::hash_public_key,
    jwk::JWK,
    ldp::{ProofSuite, TezosSignature2021},
    one_or_many::OneOrMany,
    tzkey::jwk_from_tezos_key,
    vc::{Credential, Evidence, LinkedDataProofOptions, Proof},
};
use std::collections::HashMap;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::future_to_promise;

macro_rules! jserr {
    ($expression:expr) => {
        match $expression {
            Ok(a) => a,
            Err(e) => {
                return Err(JsValue::from(format!("{}", e)));
            }
        }
    };
}

use wee_alloc;
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

fn build_vc_(pk: &JWK, twitter_handle: &str) -> Result<Credential> {
    // Credential {
    //     context: Contexts::Object(vec![Context::URI(URI::String("https://www.w3.org/2018/credentials/v1".to_string())), Context::URI(URI::String("https://schema.org/".to_string())), Context::Object()])
    // }
    Ok(serde_json::from_value(json!({
      "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://schema.org/",
          {
              "TwitterVerification": {

              },
              "TwitterVerificationPublicTweet": {
                  // "handle": "https://schema.org/Text",
                  // "timestamp": "https://schema.org/DateTime",
                  // "tweetId": "https://schema.org/Text"
              }
          }
      ],
      // "id": "urn:uuid:61974235-3f95-4f44-9f20-7c163bab8764",
      "type": ["VerifiableCredential", "TwitterVerification"],
      "credentialSubject": {
          "id": format!("did:pkh:tz:{}", &hash_public_key(pk)?),
          "sameAs": "https://twitter.com/".to_string() + twitter_handle
      },
      "issuer": "did:web:tzprofiles.me"
    }))?)
}

#[wasm_bindgen]
pub fn build_vc(public_key_tezos: String, twitter_handle: String) -> Result<String, JsValue> {
    let pk: JWK = jserr!(jwk_from_tezos_key(&public_key_tezos));
    let vc = jserr!(build_vc_(&pk, &twitter_handle));
    Ok(jserr!(serde_json::to_string(&vc)))
}

#[wasm_bindgen]
pub async fn witness_tweet(
    secret_key_jwk: String,
    public_key_tezos: String,
    twitter_token: String,
    twitter_handle: String,
    tweet_id: String,
) -> Promise {
    use log::Level;
    console_log::init_with_level(Level::Trace).expect("error initializing log");
    future_to_promise(async move {
        let pk: JWK = jserr!(jwk_from_tezos_key(&public_key_tezos));
        let sk: JWK = jserr!(serde_json::from_str(&secret_key_jwk));
        let twitter_res = jserr!(twitter::retrieve_tweet(twitter_token, tweet_id.clone()).await);
        let mut vc = jserr!(build_vc_(&pk, &twitter_handle));

        // TODO: move this check to later.
        if twitter_handle != twitter_res.includes.users[0].username {
            jserr!(Err(anyhow!("Trickster!")));
        }
        // TODO: Use regex to extract handle from signature string.
        let tweet_sig = jserr!(twitter::extract_signature(twitter_res.data[0].text.clone()));
        let mut props = HashMap::new();
        props.insert(
            "publicKeyJwk".to_string(),
            jserr!(serde_json::to_value(pk.clone())),
        );
        let proof = Proof {
            proof_value: Some(tweet_sig.clone()),
            verification_method: Some(format!(
                "did:pkh:tz:{}#TezosMethod2021",
                jserr!(hash_public_key(&pk))
            )),
            property_set: Some(props),
            ..Default::default()
        };
        info!("Verify tweet signature.");
        jserr!(TezosSignature2021.verify(&proof, &vc, &DIDPKH).await);

        info!("Issue credential.");
        let mut evidence_map = HashMap::new();
        evidence_map.insert(
            "handle".to_string(),
            serde_json::Value::String(twitter_handle),
        );
        evidence_map.insert(
            "timestamp".to_string(),
            serde_json::Value::String(Utc::now().to_string()),
        );
        evidence_map.insert("tweetId".to_string(), serde_json::Value::String(tweet_id));
        let evidence = Evidence {
            id: None,
            type_: vec!["TwitterVerificationPublicTweet".to_string()],
            property_set: Some(evidence_map),
        };
        vc.evidence = Some(OneOrMany::One(evidence));

        let proof = jserr!(
            vc.generate_proof(&sk, &LinkedDataProofOptions::default())
                .await
        );
        vc.proof = Some(OneOrMany::One(proof));
        Ok(jserr!(serde_json::to_string(&vc)).into())
    })
}
