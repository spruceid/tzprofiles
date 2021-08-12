extern crate wasm_bindgen;

extern crate log;
use log::info;

mod discord;
mod dns;
mod github;
mod instagram;
mod twitter;
mod utils;

use anyhow::{anyhow, Result};
use chrono::{SecondsFormat, Utc};
use js_sys::Promise;
use ssi::{
    blakesig::hash_public_key,
    jwk::JWK,
    jws::verify_bytes,
    one_or_many::OneOrMany,
    tzkey::jwk_from_tezos_key,
    vc::{Evidence, LinkedDataProofOptions, URI},
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

const SPRUCE_DIDWEB: &str = "did:web:tzprofiles.com";

fn verify_signature(data: &str, pk: &JWK, sig: &str) -> Result<()> {
    let micheline_data = ssi::tzkey::encode_tezos_signed_message(data)?;
    let (algorithm, sig_bytes) = ssi::tzkey::decode_tzsig(sig)?;
    Ok(verify_bytes(algorithm, &micheline_data, pk, &sig_bytes)?)
}

fn initialize_logging() {
    use log::Level;
    console_log::init_with_level(Level::Error).expect("error initializing log");
}

// This assumes a signature preceeded by it's source material, like format!("{}{}", sig_target, signature)
// Also assumes there is at least one `\n` separating the two, but that it is included in the signature.
// These assumptions hold for Twitter/Discord, but not Instagram
pub fn extract_signature(post: String) -> Result<(String, String)> {
    let mut sig_target = "".to_string();
    for line in post.split('\n').collect::<Vec<&str>>() {
        if line.starts_with("sig:") {
            if sig_target != "" {
                return Ok((sig_target, line[4..].to_string().clone()));
            } else {
                return Err(anyhow!("Signature target is empty."));
            }
        }
        sig_target = format!("{}{}\n", sig_target, line);
    }
    Err(anyhow!("Signature not found in message."))
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
    sig_target: String,
    sig_type: String,
) -> Promise {
    future_to_promise(async move {
        let pk: JWK = jserr!(jwk_from_tezos_key(&public_key_tezos));
        let sk: JWK = jserr!(serde_json::from_str(&secret_key_jwk));

        // TODO: Add support for other signatures when expanding to Rebase:
        let mut vc = if sig_type == "tezos" {
            jserr!(instagram::build_tzp_instagram_vc(&pk, &ig_handle))
        } else {
            return jserr!(Err(anyhow!(format!("Unknown signature type {}", sig_type))));
        };

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
                    verification_method: Some(URI::String(format!("{}#controller", SPRUCE_DIDWEB))),
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
    initialize_logging();
    future_to_promise(async move {
        let pk: JWK = jserr!(jwk_from_tezos_key(&public_key_tezos));
        let sk: JWK = jserr!(serde_json::from_str(&secret_key_jwk));
        let twitter_res = jserr!(twitter::retrieve_tweet(twitter_token, tweet_id.clone()).await);
        let mut vc = jserr!(twitter::build_twitter_vc(&pk, &twitter_handle));

        if twitter_handle.to_lowercase() != twitter_res.includes.users[0].username.to_lowercase() {
            jserr!(Err(anyhow!(format!(
                "Different twitter handle {} v. {}",
                twitter_handle.to_lowercase(),
                twitter_res.includes.users[0].username.to_lowercase()
            ))));
        }

        let (sig_target, sig) = jserr!(extract_signature(twitter_res.data[0].text.clone()));

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

        info!("{:?}", vc);

        let proof = jserr!(
            vc.generate_proof(
                &sk,
                &LinkedDataProofOptions {
                    verification_method: Some(URI::String(format!("{}#controller", SPRUCE_DIDWEB))),
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
pub async fn witness_discord(
    secret_key_jwk: String,
    public_key_tezos: String,
    discord_authorization_key: String,
    discord_handle: String,
    channel_id: String,
    message_id: String,
) -> Promise {
    initialize_logging();

    future_to_promise(async move {
        let pk: JWK = jserr!(jwk_from_tezos_key(&public_key_tezos));
        let sk: JWK = jserr!(serde_json::from_str(&secret_key_jwk));
        let discord_res = jserr!(
            discord::retrieve_discord_message(discord_authorization_key, channel_id, message_id)
                .await
        );
        let formatted_discord_handle = format!(
            "{}#{}",
            discord_res.author.username, discord_res.author.discriminator
        );

        let mut vc = jserr!(discord::build_discord_vc(&pk, &formatted_discord_handle));

        // Check for matching handles
        if discord_handle != formatted_discord_handle {
            jserr!(Err(anyhow!(format!(
                "Different Discord handle {} v. {}",
                discord_handle, formatted_discord_handle
            ))));
        }

        let (sig_target, sig) = jserr!(extract_signature(discord_res.content));
        jserr!(verify_signature(&sig_target, &pk, &sig));

        let mut props = HashMap::new();
        props.insert(
            "publicKeyJwk".to_string(),
            jserr!(serde_json::to_value(pk.clone())),
        );

        let mut evidence_map = HashMap::new();

        evidence_map.insert(
            "handle".to_string(),
            serde_json::Value::String(formatted_discord_handle),
        );
        evidence_map.insert(
            "timestamp".to_string(),
            serde_json::Value::String(Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)),
        );

        evidence_map.insert(
            "channelId".to_string(),
            serde_json::Value::String(discord_res.channel_id),
        );
        evidence_map.insert(
            "messageId".to_string(),
            serde_json::Value::String(discord_res.id),
        );

        let evidence = Evidence {
            id: None,
            type_: vec!["DiscordVerificationMessage".to_string()],
            property_set: Some(evidence_map),
        };
        vc.evidence = Some(OneOrMany::One(evidence));

        let proof = jserr!(
            vc.generate_proof(
                &sk,
                &LinkedDataProofOptions {
                    verification_method: Some(URI::String(format!("{}#controller", SPRUCE_DIDWEB))),
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
pub async fn dns_lookup(
    secret_key_jwk: String,
    public_key_tezos: String,
    domain: String,
    message: String,
) -> Promise {
    initialize_logging();

    future_to_promise(async move {
        let pk: JWK = jserr!(jwk_from_tezos_key(&public_key_tezos));
        let sk: JWK = jserr!(serde_json::from_str(&secret_key_jwk));

        let dns_result = jserr!(dns::retrieve_txt_records(domain.clone()).await);

        let mut vc = jserr!(dns::build_dns_vc(&pk, domain));

        let signature_to_resolve = jserr!(dns::find_signature_to_resolve(dns_result));

        let sig = jserr!(dns::extract_dns_signature(signature_to_resolve));

        jserr!(verify_signature(&message, &pk, &sig));

        let mut props = HashMap::new();
        props.insert(
            "publicKeyJwk".to_string(),
            jserr!(serde_json::to_value(pk.clone())),
        );

        let mut evidence_map = HashMap::new();

        evidence_map.insert(
            "timestamp".to_string(),
            serde_json::Value::String(Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)),
        );

        evidence_map.insert(
            "dnsServer".to_string(),
            serde_json::Value::String("https://cloudflare-dns.com/dns-query".to_string()),
        );

        let evidence = Evidence {
            id: None,
            type_: vec!["DnsVerificationMessage".to_string()],
            property_set: Some(evidence_map),
        };
        vc.evidence = Some(OneOrMany::One(evidence));

        let proof = jserr!(
            vc.generate_proof(
                &sk,
                &LinkedDataProofOptions {
                    verification_method: Some(URI::String(format!("{}#controller", SPRUCE_DIDWEB))),
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
pub async fn gist_lookup(
    secret_key_jwk: String,
    public_key_tezos: String,
    gist_id: String,
    github_username: String,
) -> Promise {
    initialize_logging();

    future_to_promise(async move {
        let pk: JWK = jserr!(jwk_from_tezos_key(&public_key_tezos));
        let sk: JWK = jserr!(serde_json::from_str(&secret_key_jwk));

        let gist_result = jserr!(github::retrieve_gist_message(gist_id.clone()).await);

        let mut vc = jserr!(github::build_gist_vc(&pk, github_username.clone()));

        // check for matching usernames
        if github_username.to_lowercase() != gist_result.owner.login.to_lowercase() {
            jserr!(Err(anyhow!(format!(
                "Different Github username {} v. {}",
                github_username, gist_result.owner.login
            ))));
        }

        let (sig_target, sig) = jserr!(extract_signature(
            gist_result.files.tzprofiles_verification.content.clone()
        ));

        jserr!(verify_signature(&sig_target, &pk, &sig));

        let mut props = HashMap::new();
        props.insert(
            "publicKeyJwk".to_string(),
            jserr!(serde_json::to_value(pk.clone())),
        );

        let mut evidence_map = HashMap::new();

        evidence_map.insert(
            "timestamp".to_string(),
            serde_json::Value::String(Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)),
        );

        evidence_map.insert("gistId".to_string(), serde_json::Value::String(gist_id));

        evidence_map.insert(
            "gistApiAddress".to_string(),
            serde_json::Value::String("https://api.github.com/gists/".to_string()),
        );

        evidence_map.insert(
            "gistMessage".to_string(),
            serde_json::Value::String(gist_result.files.tzprofiles_verification.content.clone()),
        );

        evidence_map.insert(
            "gistVersion".to_string(),
            serde_json::Value::String(
                jserr!(gist_result.history.last().ok_or("No version history found"))
                    .version
                    .clone(),
            ),
        );

        let evidence = Evidence {
            id: None,
            type_: vec!["GithubVerificationMessage".to_string()],
            property_set: Some(evidence_map),
        };
        vc.evidence = Some(OneOrMany::One(evidence));

        let proof = jserr!(
            vc.generate_proof(
                &sk,
                &LinkedDataProofOptions {
                    verification_method: Some(URI::String(format!("{}#controller", SPRUCE_DIDWEB))),
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
