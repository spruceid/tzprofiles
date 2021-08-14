pub trait Attestation {
    fn attest(&self) -> String;
}

pub struct Discord {
    pub handle: String,
    pub pubkey: String
}

impl Attestation for Discord {
    fn attest(&self) -> String {
        format!(
            "I am attesting that this discord handle {} is linked to the Tezos account {} for tzprofiles\n\n",
            self.handle,
            self.pubkey
        )
    }
}

pub struct Dns {
    pub domain: String,
    pub pubkey: String
}

impl Attestation for Dns {
    fn attest(&self) -> String {
        format!(
            "{} is linked to {}",
            self.domain,
            self.pubkey
        )
    }
}

pub struct Twitter {
    pub handle: String,
    pub pubkey: String
}

impl Attestation for Twitter {
    fn attest(&self) -> String {
        format!(
            "I am attesting that this twitter handle @{} is linked to the Tezos account {} for @tzprofiles\n\n",
            self.handle,
            self.pubkey
        )
    }
}

pub struct TwitterV0 {
    pub handle: String,
    pub pubkey: String
}

impl Attestation for TwitterV0 {
    fn attest(&self) -> String {
        format!(
            "I am attesting that this twitter handle @{} is linked to the Tezos account {} for @tezos_profiles\n\n",
            self.handle,
            self.pubkey
        )
    }
}


