from typing import Any
from typing import Dict

from dipdup import fields
from dipdup.models import Model


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
        self.resolved = False
        self.alias = None  # type: ignore[assignment]
        self.description = None  # type: ignore[assignment]
        self.logo = None  # type: ignore[assignment]
        self.website = None  # type: ignore[assignment]
        self.twitter = None  # type: ignore[assignment]
        self.domain_name = None  # type: ignore[assignment]
        self.discord = None
        self.github = None
        self.ethereum = None

    @property
    def metadata(self) -> Dict[str, Any]:
        return {
            'alias': self.alias,
            'description': self.description,
            'logo': self.logo,
            'website': self.website,
            'twitter': self.twitter,
            'domain_name': self.domain_name,
            'discord': self.discord,
            'github': self.github,
            'ethereum': self.ethereum,
        }

    class Meta:
        table = 'tzprofiles'
