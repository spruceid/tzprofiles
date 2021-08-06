use anyhow::Result;
use log::info;
use reqwest::header::{HeaderMap, USER_AGENT};
use serde::Deserialize;
use url::Url;

#[derive(Deserialize, Debug)]
pub struct GithubResponse {
    files: GithubFile,
}

#[derive(Deserialize, Debug)]
pub struct GithubFile {
    #[serde(rename = "tzprofilesVerification.txt")]
    tzprofiles_verification: GistContent,
}

#[derive(Deserialize, Debug)]
pub struct GistContent {
    content: String,
}

pub async fn retrieve_gist_message(gist_id: String) -> Result<GithubResponse> {
    let client = reqwest::Client::new();
    let request_url = format!("https://api.github.com/gists/{}", gist_id);

    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, format!("Spruce Systems").parse()?);

    // let response_body = reqwest::get(request_url.clone()).await?.text().await?;
    // info!("Response Body: {}", response_body);

    let res = client
        .get(Url::parse(&request_url)?)
        .headers(headers)
        .send()
        .await?
        .json()
        .await?;

    info!("{:?}", res);

    Ok(res)
}
