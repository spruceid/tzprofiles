use crate::SPRUCE_DIDWEB;
use anyhow::{anyhow, Result};
use chrono::{SecondsFormat, Utc};
use reqwest::header::{HeaderMap, AUTHORIZATION};
use serde::Deserialize;
use serde_json::json;
use ssi::{blakesig::hash_public_key, jwk::JWK, vc::Credential};
use url::Url;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct TwitterResponseData {
    pub text: String,
}

#[derive(Deserialize)]
pub struct TwitterResponseUser {
    pub username: String,
}

#[derive(Deserialize)]
pub struct TwitterResponseIncludes {
    pub users: Vec<TwitterResponseUser>,
}

#[derive(Deserialize)]
pub struct TwitterResponse {
    pub data: Vec<TwitterResponseData>,
    pub includes: TwitterResponseIncludes,
}

pub async fn retrieve_tweet(api_token: String, tweet_id: String) -> Result<TwitterResponse> {
    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, format!("Bearer {}", &api_token).parse()?);
    let client = reqwest::Client::new();

    let res = client
        .get(Url::parse("https://api.twitter.com/2/tweets")?)
        .query(&[
            ("ids", tweet_id),
            ("expansions", "author_id".to_string()),
            ("user.fields", "username".to_string()),
        ])
        .headers(headers)
        .send()
        .await?
        .json()
        .await?;
    Ok(res)
}

pub fn build_twitter_vc(pk: &JWK, twitter_handle: &str) -> Result<Credential> {
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
