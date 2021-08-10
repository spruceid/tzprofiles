use crate::SPRUCE_DIDWEB;
use anyhow::{anyhow, Result};
use chrono::{SecondsFormat, Utc};
use serde::{Deserialize, Serialize};
use serde_json::json;
use ssi::{blakesig::hash_public_key, jwk::JWK, vc::Credential};
use url::Url;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub username: String,
    pub id: String,
}

#[derive(Serialize, Deserialize)]
pub struct Post {
    pub sig: String,
    pub sig_target: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CaptionWrapper {
    pub caption: String,
    pub permalink: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PostWrapper {
    pub data: Vec<PostId>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PostId {
    pub id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Auth {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_uri: String,
    pub code: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct AuthForm {
    pub client_id: String,
    pub client_secret: String,
    pub grant_type: String,
    pub redirect_uri: String,
    pub code: String,
}

impl AuthForm {
    fn from_auth(auth: Auth) -> Self {
        AuthForm {
            client_id: auth.client_id,
            client_secret: auth.client_secret,
            grant_type: "authorization_code".into(),
            redirect_uri: auth.redirect_uri,
            code: auth.code,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct TokenTrade {
    pub access_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KVInner {
    pub sig: String,
    pub link: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KVWrapper {
    pub key: String,
    pub val: KVInner,
}

pub async fn retrieve_user(access_token: &str) -> Result<User> {
    let url = format!(
        "https://graph.instagram.com/me?fields=id,username&access_token={}",
        access_token
    );

    let client = reqwest::Client::new();
    let res: User = client.get(Url::parse(&url)?).send().await?.json().await?;

    Ok(res)
}

pub async fn retrieve_post(user: &User, access_token: &str) -> Result<(String, String)> {
    let url = format!(
        "https://graph.instagram.com/v11.0/{}/media?access_token={}",
        &user.id, access_token
    );

    let client = reqwest::Client::new();
    let res: PostWrapper = client.get(Url::parse(&url)?).send().await?.json().await?;

    let search = res.data.iter();

    for data in search {
        let url = format!(
            "https://graph.instagram.com/{}?fields=caption,permalink&access_token={}",
            data.id, access_token
        );

        let post: CaptionWrapper = client.get(Url::parse(&url)?).send().await?.json().await?;

        for line in post.caption.split('\n').collect::<Vec<&str>>() {
            if line.starts_with("__sig:") {
                return Ok((line[6..].to_string(), post.permalink));
            }
        }
    }

    Err(anyhow!("No post with signature found in recent posts"))
}

pub fn build_tzp_instagram_vc(pk: &JWK, instagram_handle: &str) -> Result<Credential> {
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

pub async fn trade_code_for_token(auth: Auth) -> Result<String> {
    let url = "https://api.instagram.com/oauth/access_token";
    let client = reqwest::Client::new();
    let res: TokenTrade = client
        .post(Url::parse(&url)?)
        .form(&AuthForm::from_auth(auth))
        .send()
        .await?
        .json()
        .await?;

    Ok(res.access_token)
}
