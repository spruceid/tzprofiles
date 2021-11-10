from tortoise import Model, fields


class TZProfile(Model):
    account = fields.CharField(36, pk=True)
    contract = fields.CharField(36)

    valid_claims = fields.JSONField(null=True)
    invalid_claims = fields.JSONField(null=True)

    fetched = fields.BooleanField(default=False)
    failed = fields.BooleanField(default=False)

    # twitter = fields.CharField(max_length=255)
    # domain_name = fields.CharField(max_length=255)
    # discord = fields.CharField(max_length=255)
    # github = fields.CharField(max_length=255)

    class Meta:
        table = 'tzprofiles'
