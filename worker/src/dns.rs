use crate::SPRUCE_DIDWEB;
use anyhow::{anyhow, Result};
use chrono::{SecondsFormat, Utc};
use serde::Deserialize;
use serde_json::json;
use ssi::{blakesig::hash_public_key, jwk::JWK, vc::Credential};
use url::Url;
use uuid::Uuid;

#[derive(Deserialize, Debug)]
pub struct DnsResponse {
    pub Answer: Vec<AnswerResponse>,
}

#[derive(Deserialize, Debug)]
pub struct AnswerResponse {
    pub name: String,
    pub data: String,
}

pub fn extract_dns_signature(tweet: String) -> Result<(String, String)> {
    let mut sig_target = "".to_string();
    for line in tweet.split('=').collect::<Vec<&str>>() {
        if line.starts_with("sig:") {
            if sig_target != "" {
                return Ok((sig_target, line[4..].to_string().clone()));
            } else {
                return Err(anyhow!("Signature target is empty."));
            }
        }
        sig_target = format!("{}{}", sig_target, line);
    }
    Err(anyhow!("Signature not found in message."))
}

pub async fn retrieve_dns_response(domain: String) -> Result<DnsResponse> {
    let client = reqwest::Client::new();
    let request_url = format!(
        "https://cloudflare-dns.com/dns-query?name={}&type=txt&ct=application/dns-json",
        domain
    );

    let res = client
        .get(Url::parse(&request_url)?)
        .send()
        .await?
        .json()
        .await?;

    Ok(res)
}

pub fn build_dns_vc(pk: &JWK) -> Result<Credential> {
    Ok(serde_json::from_value(json!({
      "@context": [
          "https://www.w3.org/2018/credentials/v1",
          {
              "sameAs": "http://schema.org/sameAs",
              "DnsVerification": "https://tzprofiles.com/DnsVerification",
              "DnsVerificationMessage": {
                  "@id": "https://tzprofiles.com/DnsVerificationMessage",
                  "@context": {
                      "@version": 1.1,
                      "@protected": true,
                      "handle": "https://tzprofiles.com/handle",
                      "timestamp": {
                          "@id": "https://tzprofiles.com/timestamp",
                          "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
                      },
                      "domain": "https://tzprofiles.com/domain",
                  }
              }
          }
      ],
      "issuanceDate": Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
      "id": format!("urn:uuid:{}", Uuid::new_v4().to_string()),
      "type": ["VerifiableCredential", "DnsVerification"],
      "credentialSubject": {
          "id": format!("did:pkh:tz:{}", &hash_public_key(pk)?),
      },
      "issuer": SPRUCE_DIDWEB
    }))?)
}
