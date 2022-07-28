from typing import cast

from dipdup.context import HandlerContext
from dipdup.models import Transaction

import tzprofiles_indexer.models as models
from tzprofiles_indexer.handlers import save_claims
from tzprofiles_indexer.types.tzprofile.parameter.default import DefaultParameter
from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage


async def on_update(
    ctx: HandlerContext,
    tzprofile_update: Transaction[DefaultParameter, TzprofileStorage],
) -> None:
    contract = cast(str, tzprofile_update.data.target_address)
    profile = await models.TZProfile.filter(account=tzprofile_update.storage.owner).get()
    if profile.contract == contract:
        await save_claims(profile, tzprofile_update.storage.claims)
