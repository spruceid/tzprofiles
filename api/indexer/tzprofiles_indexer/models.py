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
        self.valid_claims = []
        self.invalid_claims = []
        self.failed = False
        self.fetched = False
        self.alias = None
        self.description = None
        self.logo = None
        self.website = None
        self.twitter = None
        self.domain_name = None
        self.discord = None
        self.github = None
        self.ethereum = None

    class Meta:
        table = 'tzprofiles'
