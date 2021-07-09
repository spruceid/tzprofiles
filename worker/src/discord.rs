use anyhow::Result;
use reqwest::header::{HeaderMap, AUTHORIZATION};
use serde::Deserialize;
use url::Url;

#[derive(Deserialize)]
pub struct DiscordResponse {
    pub id: String,
    pub content: String,
    pub channel_id: String,
    pub author: Author,
    pub attachments: Vec<String>,
    pub embeds: Vec<String>,
    pub mentions: Vec<String>,
    pub mention_roles: Vec<String>,
    pub pinned: bool,
    pub tts: bool,
    pub timestamp: String,
    pub edited_timestamp: String,
    pub flags: u64,
    pub components: Vec<String>,
}

#[derive(Deserialize)]
pub struct Author {
    pub id: String,
    pub username: String,
    pub avatar: String,
    pub discriminator: String,
    pub public_flags: u64,
}

pub async fn retrieve_discord_message(
    api_token: String,
    channel_id: String,
    message_id: String,
) -> Result<DiscordResponse> {
    let mut headers = HeaderMap::new();
    headers.insert(AUTHORIZATION, format!("Bot {}", &api_token).parse()?);
    let client = reqwest::Client::new();
    let requestUrl = format!(
        "https://discord.com/api/channels/{}/messages/{}",
        channel_id, message_id
    );
    let res = client
        .get(Url::parse(&requestUrl)?)
        .headers(headers)
        .send()
        .await?
        .json()
        .await?;
    Ok(res)
}
