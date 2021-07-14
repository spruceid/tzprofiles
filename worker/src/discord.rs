mod lib;

use anyhow::Result;
use chrono::{SecondsFormat, Utc};
use reqwest::header::{HeaderMap, AUTHORIZATION};
use serde::Deserialize;
use serde_json::json;
use ssi::{blakesig::hash_public_key, jwk::JWK, vc::Credential};
use url::Url;
use uuid::Uuid;

const SPRUCE_DIDWEB: &str = "did:web:tzprofiles.com";

#[derive(Deserialize, Debug)]
pub struct DiscordResponse {
    pub id: String,
    pub content: String,
    pub channel_id: String,
    pub author: Author,
    pub timestamp: String,
}

#[derive(Deserialize, Debug)]
pub struct Author {
    pub id: String,
    pub username: String,
    pub discriminator: String,
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
                      "channelId": "https://tzprofiles.com/DiscordChannelId",
                      "messageId": "https://tzprofiles.com/DiscordMessageId",
                  }
              }
          }
      ],
      "issuanceDate": Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
      "id": format!("urn:uuid:{}", Uuid::new_v4().to_string()),
      "type": ["VerifiableCredential", "DiscordVerification"],
      "credentialSubject": {
          "id": format!("did:pkh:tz:{}", &hash_public_key(pk)?),
          "sameAs": "urn:discord.com:".to_string() + discord_handle
      },
      "issuer": SPRUCE_DIDWEB
    }))?)
}
