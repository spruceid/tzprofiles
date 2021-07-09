extern crate wasm_bindgen;

#[macro_use]
extern crate log;

mod instagram;
mod twitter;
mod utils;

use anyhow::{anyhow, Result};
use chrono::{SecondsFormat, Utc};
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
use uuid::Uuid;

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

const SPRUCE_DIDWEB: &str = "did:web:tzprofiles.com";

fn build_instagram_vc_(pk: &JWK, instagram_handle: &str) -> Result<Credential> {
    Ok(serde_json::from_value(json!({
      "@context": [
          "https://www.w3.org/2018/credentials/v1",
          {
              "sameAs": "http://schema.org/sameAs",
              "InstagramVerification": "https://tzprofiles.com/InstagramVerification",
              "InstagramVerificationPublicPost": {
                  "@id": "https://tzprofiles.com/InstagramVerificationPublicPost",
                  "@context": {
                      "@version": 1.1,
                      "@protected": true,
                      "handle": "https://tzprofiles.com/handle",
                      "timestamp": {
                          "@id": "https://tzprofiles.com/timestamp",
                          "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
                      },
                      "postUrl": "https://tzprofiles.com/postUrl"
                  }
              }
          }
      ],
      "issuanceDate": Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
      "id": format!("urn:uuid:{}", Uuid::new_v4().to_string()),
      "type": ["VerifiableCredential", "InstagramVerification"],
      "credentialSubject": {
          "id": format!("did:pkh:tz:{}", &hash_public_key(pk)?),
          "sameAs": "https://instagram.com/".to_string() + instagram_handle
      },
      "issuer": SPRUCE_DIDWEB
    }))?)
}

fn build_twitter_vc_(pk: &JWK, twitter_handle: &str) -> Result<Credential> {
    // Credential {
    //     context: Contexts::Object(vec![Context::URI(URI::String("https://www.w3.org/2018/credentials/v1".to_string())), Context::URI(URI::String("https://schema.org/".to_string())), Context::Object()])
    // }
    Ok(serde_json::from_value(json!({
      "@context": [
          "https://www.w3.org/2018/credentials/v1",
          {
              "sameAs": "http://schema.org/sameAs",
              "TwitterVerification": "https://tzprofiles.com/TwitterVerification",
              "TwitterVerificationPublicTweet": {
                  "@id": "https://tzprofiles.com/TwitterVerificationPublicTweet",
                  "@context": {
                      "@version": 1.1,
                      "@protected": true,
                      "handle": "https://tzprofiles.com/handle",
                      "timestamp": {
                          "@id": "https://tzprofiles.com/timestamp",
                          "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
                      },
                      "tweetId": "https://tzprofiles.com/tweetId"
                  }
              }
          }
      ],
      "issuanceDate": Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
      "id": format!("urn:uuid:{}", Uuid::new_v4().to_string()),
      "type": ["VerifiableCredential", "TwitterVerification"],
      "credentialSubject": {
          "id": format!("did:pkh:tz:{}", &hash_public_key(pk)?),
          "sameAs": "https://twitter.com/".to_string() + twitter_handle
      },
      "issuer": SPRUCE_DIDWEB
    }))?)
}

fn verify_signature(data: &str, pk: &JWK, sig: &str) -> Result<()> {
    info!("Verify tweet signature.");
    let micheline_data = ssi::tzkey::encode_tezos_signed_message(data)?;
    let (algorithm, sig_bytes) = ssi::tzkey::decode_tzsig(sig)?;
    Ok(verify_bytes(algorithm, &micheline_data, pk, &sig_bytes)?)
}

#[wasm_bindgen]
pub async fn handle_instagram_login(
    client_id: String,
    client_secret: String,
    redirect_uri: String,
    code: String,
) -> Promise {
    future_to_promise(async move {
        let auth = instagram::Auth {
            client_id,
            client_secret,
            redirect_uri,
            code,
        };

        let access_token: String = jserr!(instagram::trade_code_for_token(auth).await);
        let user = jserr!(instagram::retrieve_user(&access_token).await);
        let (sig, permalink) = jserr!(instagram::retrieve_post(&user, &access_token).await);

        Ok(jserr!(serde_json::to_string(&instagram::KVWrapper {
            key: user.username,
            val: instagram::KVInner {
                sig: sig,
                link: permalink,
            },
        }))
        .into())
    })
}

#[wasm_bindgen]
pub async fn witness_instagram_post(
    secret_key_jwk: String,
    public_key_tezos: String,
    ig_handle: String,
    ig_link: String,
    sig: String,
) -> Promise {
    future_to_promise(async move {
        let pk: JWK = jserr!(jwk_from_tezos_key(&public_key_tezos));
        let sk: JWK = jserr!(serde_json::from_str(&secret_key_jwk));

        let mut vc = jserr!(build_instagram_vc_(&pk, &ig_handle));
        let sig_target = instagram::target_from_handle(&ig_handle, jserr!(&hash_public_key(&pk)));

        let mut props = HashMap::new();
        props.insert(
            "publicKeyJwk".to_string(),
            jserr!(serde_json::to_value(pk.clone())),
        );
        jserr!(verify_signature(&sig_target, &pk, &sig));

        info!("Issue credential.");
        let mut evidence_map = HashMap::new();
        evidence_map.insert("handle".to_string(), serde_json::Value::String(ig_handle));
        evidence_map.insert(
            "timestamp".to_string(),
            serde_json::Value::String(Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)),
        );
        evidence_map.insert("postUrl".to_string(), serde_json::Value::String(ig_link));

        let evidence = Evidence {
            id: None,
            type_: vec!["InstagramVerificationPublicPost".to_string()],
            property_set: Some(evidence_map),
        };
        vc.evidence = Some(OneOrMany::One(evidence));

        let proof = jserr!(
            vc.generate_proof(
                &sk,
                &LinkedDataProofOptions {
                    verification_method: Some(format!("{}#controller", SPRUCE_DIDWEB)),
                    ..Default::default()
                }
            )
            .await
        );
        vc.proof = Some(OneOrMany::One(proof));

        Ok(jserr!(serde_json::to_string(&vc)).into())
    })
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
        let mut vc = jserr!(build_twitter_vc_(&pk, &twitter_handle));

        if twitter_handle.to_lowercase() != twitter_res.includes.users[0].username.to_lowercase() {
            jserr!(Err(anyhow!(format!(
                "Different twitter handle {} v. {}",
                twitter_handle.to_lowercase(),
                twitter_res.includes.users[0].username.to_lowercase()
            ))));
        }

        let (sig_target, sig) =
            jserr!(twitter::extract_signature(twitter_res.data[0].text.clone()));

        let mut props = HashMap::new();
        props.insert(
            "publicKeyJwk".to_string(),
            jserr!(serde_json::to_value(pk.clone())),
        );
        jserr!(verify_signature(&sig_target, &pk, &sig));

        info!("Issue credential.");
        let mut evidence_map = HashMap::new();
        evidence_map.insert(
            "handle".to_string(),
            serde_json::Value::String(twitter_handle),
        );
        evidence_map.insert(
            "timestamp".to_string(),
            serde_json::Value::String(Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)),
        );
        evidence_map.insert("tweetId".to_string(), serde_json::Value::String(tweet_id));
        let evidence = Evidence {
            id: None,
            type_: vec!["TwitterVerificationPublicTweet".to_string()],
            property_set: Some(evidence_map),
        };
        vc.evidence = Some(OneOrMany::One(evidence));

        let proof = jserr!(
            vc.generate_proof(
                &sk,
                &LinkedDataProofOptions {
                    verification_method: Some(format!("{}#controller", SPRUCE_DIDWEB)),
                    ..Default::default()
                }
            )
            .await
        );
        vc.proof = Some(OneOrMany::One(proof));
        Ok(jserr!(serde_json::to_string(&vc)).into())
    })
}

#[test]
#[should_panic]
fn test_bad_sig() {
    verify_signature("", &jwk_from_tezos_key("edpkvRWhuk5cLe5vwR7TGfSJxVLmVDk5og45WAhsAAvfqQXmYKNPve").unwrap(), "edsigtk2FRtmFKJR125SZH3vRNgv6DNm4HqjBdzb736GptFRbj4Zj9fuURJQeaPyaDWT8QYv4w8scSPyTRXKSoeffpXGeagyW9G").unwrap()
}

#[test]
#[should_panic]
fn test_bad_sig_target() {
    verify_signature("I am attesting that this Twitter handle @BihelSimon is linked to the Tezos account tz1giDGsifWB9q9siekCKQaJKrmC9da5M43J.", &jwk_from_tezos_key("edpkvRWhuk5cLe5vwR7TGfSJxVLmVDk5og45WAhsAAvfqQXmYKNPve").unwrap(), "edsigtvJYvymTLaGPwbwcmtcfNNGcrSFtGNUWuXgwHXM52EU8zpqbYYq8Hw7cQfyZ4yspG4cVEqUyi4iCCdbu6HqgNDp4EEmoTj").unwrap()
}

#[test]
fn test_sig() {
    verify_signature("I am attesting that this Twitter handle @BihelSimon is linked to the Tezos account tz1giDGsifWB9q9siekCKQaJKrmC9da5M43J.\n\n", &jwk_from_tezos_key("edpkvRWhuk5cLe5vwR7TGfSJxVLmVDk5og45WAhsAAvfqQXmYKNPve").unwrap(), "edsigtvJYvymTLaGPwbwcmtcfNNGcrSFtGNUWuXgwHXM52EU8zpqbYYq8Hw7cQfyZ4yspG4cVEqUyi4iCCdbu6HqgNDp4EEmoTj").unwrap()
}
