from tortoise import Model, fields


class TZProfile(Model):
    account = fields.CharField(36, pk=True)
    contract = fields.CharField(36)
    valid_claims = fields.JSONField()
    invalid_claims = fields.JSONField()
    errored = fields.BooleanField()
    alias = fields.TextField(null=True)
    description = fields.TextField(null=True)
    logo = fields.TextField(null=True)
    website = fields.TextField(null=True)
    twitter = fields.CharField(max_length=256, null=True)
    domain_name = fields.TextField(null=True)
    discord = fields.CharField(max_length=256, null=True)
    github = fields.CharField(max_length=256, null=True)
    ethereum = fields.CharField(max_length=42, null=True)

    class Meta:
        table = "tzprofiles"
