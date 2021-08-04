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
    #[serde(rename = "Answer")]
    pub answer: Vec<AnswerResponse>,
}

#[derive(Deserialize, Debug)]
pub struct AnswerResponse {
    pub name: String,
    pub data: String,
}

pub fn find_signature_to_resolve(dns_result: DnsResponse) -> String {
    let mut signature_to_resolve = "".to_string();
    for answer in dns_result.answer {
        let trimmed_signature: &str = &answer.data[1..answer.data.len() - 1];
        if trimmed_signature.starts_with("tzprofiles-verification") {
            signature_to_resolve = trimmed_signature.to_string();
        }
    }
    return signature_to_resolve;
}

pub fn extract_dns_signature(record: String) -> Result<String> {
    let split = record.split("=");
    let str_list = split.collect::<Vec<&str>>();

    if str_list.len() != 2 {
        return Err(anyhow!("Signature isn't matched"));
    }

    Ok(str_list[1].clone().to_string())
}

pub async fn retrieve_txt_records(domain: String) -> Result<DnsResponse> {
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
                      "dns": "https://tzprofiles.com/dns",
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
