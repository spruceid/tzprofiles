from tortoise import Model, fields


class TZProfile(Model):
    account = fields.CharField(36, pk=True)
    contract = fields.CharField(36)
    valid_claims = fields.JSONField()
    invalid_claims = fields.JSONField()
    errored = fields.BooleanField()

    class Meta:
        table = "tzprofiles"
