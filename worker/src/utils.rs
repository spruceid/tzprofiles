extern crate console_error_panic_hook;
use anyhow::{anyhow, Result};

pub use self::console_error_panic_hook::set_once as set_panic_hook;

pub fn extract_signature(text: String) -> Result<(String, String)> {
    let mut sig_target = "".to_string();
    for line in text.split('\n').collect::<Vec<&str>>() {
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
