extern crate wasm_bindgen;

#[macro_use]
extern crate log;

mod twitter;
mod utils;

use anyhow::{anyhow, Result};
use chrono::Utc;
use js_sys::Promise;
use serde_json::json;
use ssi::{
    blakesig::hash_public_key,
    jwk::{Algorithm, JWK},
    jws::verify_bytes,
    one_or_many::OneOrMany,
    tzkey::jwk_from_tezos_key,
    vc::{Credential, Evidence, LinkedDataProofOptions},
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

fn verify_signature(data: &[u8], pk: &JWK, sig: &[u8]) -> Result<()> {
    info!("Verify tweet signature.");
    let tezos_data = ["Tezos Signed Message:".as_bytes(), data].join(" ".as_bytes());
    const BYTES_PREFIX: &[u8] = &[05, 01];
    let length = tezos_data.len() as u32;
    let micheline_data = [BYTES_PREFIX, &length.to_be_bytes(), &tezos_data].concat();
    let hashed = blake2b_simd::Params::new()
        .hash_length(32)
        .hash(&micheline_data)
        .as_bytes()
        .to_vec();
    let sig_decoded = bs58::decode(&sig).with_check(None).into_vec()?;
    let (algorithm, sig_bytes) = if sig.starts_with("edsig".as_bytes()) {
        (Algorithm::EdDSA, &sig_decoded[5..])
    } else if sig.starts_with("4sLJ".as_bytes()) {
        (Algorithm::ES256K, &sig[5..])
    } else if sig.starts_with("p2sig".as_bytes()) {
        (Algorithm::ES256, &sig[4..])
    } else {
        return Err(anyhow!("Unsupported signature type."));
    };
    Ok(verify_bytes(algorithm, &hashed, pk, &sig_bytes)?)
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

        if twitter_handle != twitter_res.includes.users[0].username {
            jserr!(Err(anyhow!("Different twitter handle.")));
        }
        let (sig_target, sig) =
            jserr!(twitter::extract_signature(twitter_res.data[0].text.clone()));
        let mut props = HashMap::new();
        props.insert(
            "publicKeyJwk".to_string(),
            jserr!(serde_json::to_value(pk.clone())),
        );
        jserr!(verify_signature(
            &sig_target.as_bytes(),
            &pk,
            &sig.as_bytes()
        ));

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

#[test]
#[should_panic]
fn test_bad_sig() {
    verify_signature("".as_bytes(), &jwk_from_tezos_key("edpkvRWhuk5cLe5vwR7TGfSJxVLmVDk5og45WAhsAAvfqQXmYKNPve").unwrap(), "edsigtk2FRtmFKJR125SZH3vRNgv6DNm4HqjBdzb736GptFRbj4Zj9fuURJQeaPyaDWT8QYv4w8scSPyTRXKSoeffpXGeagyW9G".as_bytes()).unwrap()
}

#[test]
#[should_panic]
fn test_bad_sig_target() {
    verify_signature("I am attesting that this Twitter handle @BihelSimon is linked to the Tezos account tz1giDGsifWB9q9siekCKQaJKrmC9da5M43J.".as_bytes(), &jwk_from_tezos_key("edpkvRWhuk5cLe5vwR7TGfSJxVLmVDk5og45WAhsAAvfqQXmYKNPve").unwrap(), "edsigtvJYvymTLaGPwbwcmtcfNNGcrSFtGNUWuXgwHXM52EU8zpqbYYq8Hw7cQfyZ4yspG4cVEqUyi4iCCdbu6HqgNDp4EEmoTj".as_bytes()).unwrap()
}

#[test]
fn test_sig() {
    verify_signature("I am attesting that this Twitter handle @BihelSimon is linked to the Tezos account tz1giDGsifWB9q9siekCKQaJKrmC9da5M43J.\n\n".as_bytes(), &jwk_from_tezos_key("edpkvRWhuk5cLe5vwR7TGfSJxVLmVDk5og45WAhsAAvfqQXmYKNPve").unwrap(), "edsigtvJYvymTLaGPwbwcmtcfNNGcrSFtGNUWuXgwHXM52EU8zpqbYYq8Hw7cQfyZ4yspG4cVEqUyi4iCCdbu6HqgNDp4EEmoTj".as_bytes()).unwrap()
}
