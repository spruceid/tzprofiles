use anyhow::Result;
use chrono::{SecondsFormat, Utc};
use reqwest::header::{HeaderMap, AUTHORIZATION};
use serde::Deserialize;
use serde_json::json;
use ssi::{
    blakesig::hash_public_key,
    jwk::{Algorithm, JWK},
    jws::verify_bytes,
    one_or_many::OneOrMany,
    tzkey::jwk_from_tezos_key,
    vc::{Credential, Evidence, LinkedDataProofOptions},
};
use url::Url;
use uuid::Uuid;

const SPRUCE_DIDWEB: &str = "did:web:tzprofiles.com";

#[derive(Deserialize, Debug)]
pub struct DiscordResponse {
    pub id: String,
    pub content: String,
    pub channel_id: String,
    pub author: Author,
    pub attachments: Vec<String>,
    pub embeds: Vec<String>,
    pub mentions: Vec<String>,
    pub mention_roles: Vec<String>,
    pub pinned: bool,
    pub tts: bool,
    pub timestamp: String,
    pub edited_timestamp: Option<String>,
    pub flags: u64,
    pub components: Vec<String>,
}

#[derive(Deserialize, Debug)]
pub struct Author {
    pub id: String,
    pub username: String,
    pub avatar: String,
    pub discriminator: String,
    pub public_flags: u64,
}

pub async fn retrieve_discord_message(
    discord_authorization_key: String,
    channel_id: String,
    message_id: String,
) -> Result<DiscordResponse> {
    let mut headers = HeaderMap::new();
    headers.insert(
        AUTHORIZATION,
        format!("Bot {}", &discord_authorization_key).parse()?,
    );
    let client = reqwest::Client::new();
    let request_url = format!(
        "https://discord.com/api/channels/{}/messages/{}",
        channel_id, message_id
    );

    let res = client
        .get(Url::parse(&request_url)?)
        .headers(headers)
        .send()
        .await?
        .json()
        .await?;

    Ok(res)
}

// pub fn extract_discord_signature(discordMessage: String) -> Result<(String, String)> {
//     for line in discordMessage.split('\n').collect::<Vec<&str>>() {
//         if line.starts_with('sig:')
//     }
// }

pub fn build_discord_vc(pk: &JWK, discord_handle: &str) -> Result<Credential> {
    Ok(serde_json::from_value(json!({
      "@context": [
          "https://www.w3.org/2018/credentials/v1",
          {
              "sameAs": "http://schema.org/sameAs",
              "DiscordVerification": "https://tzprofiles.com/DiscordVerification",
              "DiscordVerificationMessage": {
                  "@id": "https://tzprofiles.com/DiscordVerificationMessage",
                  "@context": {
                      "@version": 1.1,
                      "@protected": true,
                      "handle": "https://tzprofiles.com/handle",
                      "timestamp": {
                          "@id": "https://tzprofiles.com/timestamp",
                          "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
                      },
                      "DiscordMessageId": "https://tzprofiles.com/DiscordMessageId"
                  }
              }
          }
      ],
      "issuanceDate": Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
      "id": format!("urn:uuid:{}", Uuid::new_v4().to_string()),
      "type": ["VerifiableCredential", "DiscordVerification"],
      "credentialSubject": {
          "id": format!("did:pkh:tz:{}", &hash_public_key(pk)?),
          "sameAs": "https://twitter.com/".to_string() + discord_handle
      },
      "issuer": SPRUCE_DIDWEB
    }))?)
}
