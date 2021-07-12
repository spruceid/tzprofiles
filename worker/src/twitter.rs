use anyhow::{anyhow, Result};
use reqwest::header::{HeaderMap, AUTHORIZATION};
use serde::Deserialize;
use url::Url;
use web_sys::console::info;

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

pub fn extract_signature(tweet: String) -> Result<(String, String)> {
    let mut sig_target = "".to_string();
    for line in tweet.split('\n').collect::<Vec<&str>>() {
        if line.starts_with("sig:") {
            if sig_target != "" {
                return Ok((sig_target, line[4..].to_string().clone()));
            } else {
                return Err(anyhow!("Signature target is empty."));
            }
        }
        sig_target = format!("{}{}\n", sig_target, line);
    }
    Err(anyhow!("Signature not found in tweet."))
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
