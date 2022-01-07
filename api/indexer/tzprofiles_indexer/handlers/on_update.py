from typing import cast

from dipdup.context import HandlerContext
from dipdup.models import Transaction

import tzprofiles_indexer.models as models
from tzprofiles_indexer.types.tzprofile.parameter.default import DefaultParameter
from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage
from tzprofiles_indexer.handlers import resolve_profile


async def on_update(
    ctx: HandlerContext,
    tzprofile_update: Transaction[DefaultParameter, TzprofileStorage],
) -> None:
    profile = await models.TZProfile.get(account=tzprofile_update.storage.owner)
    if profile.contract == tzprofile_update.data.target_address:
        profile.valid_claims = []
        profile.invalid_claims = []
        profile.errored = False
        profile.alias = None
        profile.description = None
        profile.logo = None
        profile.website = None
        profile.twitter = None
        profile.domain_name = None
        profile.discord = None
        profile.github = None
        profile.ethereum = None

        await resolve_profile(tzprofile_update.storage.claims, profile)
        await profile.save()
