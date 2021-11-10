use crate::SPRUCE_DIDWEB;
use anyhow::Result;
use chrono::{SecondsFormat, Utc};
use reqwest::header::{HeaderMap, USER_AGENT};
use serde::Deserialize;
use serde_json::json;
use ssi::{blakesig::hash_public_key, jwk::JWK, vc::Credential};
use url::Url;
use uuid::Uuid;

#[derive(Deserialize, Debug)]
pub struct GithubResponse {
    pub files: GithubFile,
    pub owner: Owner,
    pub history: Vec<History>,
}

#[derive(Deserialize, Debug)]
pub struct GithubFile {
    #[serde(rename = "tzprofilesVerification.txt")]
    pub tzprofiles_verification: GistContent,
}

#[derive(Deserialize, Debug)]
pub struct Owner {
    pub login: String,
}
#[derive(Deserialize, Debug)]
pub struct GistContent {
    pub content: String,
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
              "GithubVerification": "https://tzprofiles.com/GithubVerification",
              "GithubVerificationMessage": {
                  "@id": "https://tzprofiles.com/GithubVerificationMessage",
                  "@context": {
                      "@version": 1.1,
                      "@protected": true,
                      "timestamp": {
                          "@id": "https://tzprofiles.com/timestamp",
                          "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
                      },
                      "gistId": "https://tzprofiles.com/gistId",
                      "gistApiAddress": "https://tzprofiles.com/gistApiAddress",
                      "gistMessage": "https://tzprofiles.com/gistMessage",
                      "gistVersion":  "https://tzprofiles.com/gistVersion",
                  }
              }
          }
      ],
      "issuanceDate": Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
      "id": format!("urn:uuid:{}", Uuid::new_v4().to_string()),
      "type": ["VerifiableCredential", "GithubVerification"],
      "credentialSubject": {
          "id": format!("did:pkh:tz:{}", &hash_public_key(pk)?),
          "sameAs": format!("urn:github:{}", github_username)
      },
      "issuer": SPRUCE_DIDWEB
    }))?)
}
