from dipdup.models import (
    OperationData,
    Transaction,
    Origination,
    BigMapDiff,
    BigMapData,
    BigMapAction,
)
from dipdup.context import HandlerContext, RollbackHandlerContext

import tzprofiles_indexer.models as models

from tzprofiles_indexer.types.tzprofile.parameter.default import DefaultParameter
from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage
from tzprofiles_indexer.handlers import TZP_API
from tzprofiles_indexer.handlers import resolve_tzp


async def on_update(
    ctx: HandlerContext,
    tzprofile_update: Transaction[DefaultParameter, TzprofileStorage],
) -> None:
    profile, _ = await models.TZProfile.get_or_create(
        account=tzprofile_update.storage.owner
    )
    try:
        claims = await resolve_tzp(tzprofile_update.data.target_address)
        profile.valid_claims = claims["valid"]
        profile.invalid_claims = claims["invalid"]
    except Exception as e:
        print(e)
        profile.errored = True
    await profile.save()
