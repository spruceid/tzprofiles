from tortoise import Model, fields


class TZProfile(Model):
    account = fields.CharField(36, pk=True)
    contract = fields.CharField(36)

    valid_claims = fields.JSONField(default=[])
    invalid_claims = fields.JSONField(default=[])
    unprocessed_claims = fields.JSONField(default=[])

    failed = fields.BooleanField(default=False)
    resolved = fields.BooleanField(default=False)

    alias = fields.TextField(null=True)
    description = fields.TextField(null=True)
    logo = fields.TextField(null=True)
    website = fields.TextField(null=True)
    twitter = fields.CharField(max_length=256, null=True)
    domain_name = fields.TextField(null=True)
    discord = fields.CharField(max_length=256, null=True)
    github = fields.CharField(max_length=256, null=True)
    ethereum = fields.CharField(max_length=42, null=True)

    def reset(self) -> None:
        self.valid_claims = []  # type: ignore
        self.invalid_claims = []  # type: ignore
        self.failed = False  # type: ignore
        self.fetched = False  # type: ignore
        self.alias = None  # type: ignore
        self.description = None  # type: ignore
        self.logo = None  # type: ignore
        self.website = None  # type: ignore
        self.twitter = None  # type: ignore
        self.domain_name = None  # type: ignore
        self.discord = None  # type: ignore
        self.github = None  # type: ignore
        self.ethereum = None  # type: ignore

    class Meta:
        table = 'tzprofiles'
