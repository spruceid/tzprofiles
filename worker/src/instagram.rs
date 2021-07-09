use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use url::Url;

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

pub fn target_from_handle(handle: &str, pkh: &str) -> String {
    return format!("I am attesting that this Instagram handle @{} is linked to the Tezos account {} for @tezos_profiles\n\n", handle, pkh);
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
            if line.starts_with("sig:") {
                return Ok((line[4..].to_string(), post.permalink));
            }
        }
    }

    Err(anyhow!("No post with signature found in recent posts"))
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