use crate::SPRUCE_DIDWEB;
use anyhow::Result;
use chrono::{SecondsFormat, Utc};
use reqwest::header::{HeaderMap, USER_AGENT};
use serde::Deserialize;
use serde_json::json;
use serde_json::map::{Map};
use ssi::{blakesig::hash_public_key, jwk::JWK, vc::Credential};
use url::Url;
use uuid::Uuid;


#[derive(Deserialize, Debug)]
pub struct GithubResponse {
    // This value here is { content: String }
    pub files: Map<String, serde_json::value::Value>,
    // TODO: Use serde_with and get better typing?
    // pub files: Map<String, GistContent>,
    pub owner: Owner,
    pub history: Vec<History>,
}

#[derive(Deserialize, Debug)]
pub struct Owner {
    pub login: String,
}

#[derive(Deserialize, Debug)]
pub struct History {
    pub version: String,
}

pub async fn retrieve_gist_message(gist_id: String) -> Result<GithubResponse> {
    let client = reqwest::Client::new();
    let request_url = format!("https://api.github.com/gists/{}", gist_id);

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, format!("Spruce Systems").parse()?);

    let res = client
        .get(Url::parse(&request_url)?)
        .headers(headers)
        .send()
        .await?
        .json()
        .await?;

    Ok(res)
}

pub fn build_gist_vc(pk: &JWK, github_username: String) -> Result<Credential> {
    Ok(serde_json::from_value(json!({
      "@context": [
          "https://www.w3.org/2018/credentials/v1",
          {
              "sameAs": "http://schema.org/sameAs",
              "GitHubVerification": "https://tzprofiles.com/GitHubVerification",
              "GitHubVerificationMessage": {
                  "@id": "https://tzprofiles.com/GitHubVerificationMessage",
                  "@context": {
                      "@version": 1.1,
                      "@protected": true,
                      "timestamp": {
                          "@id": "https://tzprofiles.com/timestamp",
                          "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
                      },
                      "gistId": "https://tzprofiles.com/gistId",
                      "gistVersion":  "https://tzprofiles.com/gistVersion",
                  }
              }
          }
      ],
      "issuanceDate": Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
      "id": format!("urn:uuid:{}", Uuid::new_v4().to_string()),
      "type": ["VerifiableCredential", "GitHubVerification"],
      "credentialSubject": {
          "id": format!("did:pkh:tz:{}", &hash_public_key(pk)?),
          "sameAs": format!("https://github.com/{}", github_username)
      },
      "issuer": SPRUCE_DIDWEB
    }))?)
}
