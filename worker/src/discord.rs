use anyhow::{anyhow, Result};
use reqwest::header::{HeaderMap, AUTHORIZATION};
use serde::Deserialize;
use url::Url;

// pub async fn retrieve_discord_message(api_token: String, channel_id: String, messageId: String) {
//     let mut headers = HeaderMap::new();
//     headers.insert(AUTHORIZATION, format!("Bearer {}", &api_token).parse()?));
// }
