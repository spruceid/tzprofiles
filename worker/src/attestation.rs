pub struct Subject {
    pub id: String,
    pub key: String,
}

pub enum SubjectType {
    Discord(Subject),
    Dns(Subject),
    GitHub(Subject),
    Instagram(Subject),
    Twitter(Subject),
    TwitterV0(Subject),
}

pub fn attest(subject: SubjectType) -> String {
    match subject {
        SubjectType::Discord(s) => format!(
            "I am attesting that this discord handle {} is linked to the Tezos account {} for tzprofiles\n\n",
            s.id,
            s.key
        ),
        SubjectType::Dns(s) => format!(
            "{} is linked to {}",
            s.id,
            s.key
        ),
        SubjectType::GitHub(s) => format!(
            "I am attesting that this GitHub handle {} is linked to the Tezos account {} for tzprofiles\n\n",
            s.id,
            s.key
        ),
        SubjectType::Instagram(s) => format!(
            "I am attesting that this Instagram handle {} is linked to the Tezos account {} for tzprofiles"
            s.id,
            s.key
        ),
        SubjectType::Twitter(s) => format!(
            "I am attesting that this twitter handle @{} is linked to the Tezos account {} for @tzprofiles\n\n",
            s.id,
            s.key
        ),
        SubjectType::TwitterV0(s) => format!(
            "I am attesting that this twitter handle @{} is linked to the Tezos account {} for @tezos_profiles\n\n",
            s.id,
            s.key
        ) 
    }
}