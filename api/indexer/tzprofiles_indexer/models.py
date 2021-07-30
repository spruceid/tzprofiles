from tortoise import Model, fields


class TZProfile(Model):
    account = fields.CharField(36, pk=True)
    contract = fields.CharField(36)
    valid_claims = fields.JSONField(null=True)
    invalid_claims = fields.JSONField(null=True)

    class Meta:
        table = "tzprofiles"
