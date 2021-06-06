from dipdup.models import (
    OperationData,
    OperationHandlerContext,
    OriginationContext,
    TransactionContext,
)

import tzprofiles_indexer.models as models

from tzprofiles_indexer.types.tzprofile.parameter.default import DefaultParameter
from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage
from tzprofiles_indexer.handlers import TZP_API
from tzprofiles_indexer.handlers import resolve_tzp


async def on_update(
    ctx: OperationHandlerContext,
    tzprofile_update: TransactionContext[DefaultParameter, TzprofileStorage],
) -> None:
    profile, _ = await models.TZProfile.get_or_create(
        account=tzprofile_update.storage.owner
    )
    try:
        claims = resolve_tzp(tzprofile_update.storage.owner)
        profile.valid_claims = claims["valid"]
        profile.invalid_claims = claims["invalid"]
    except Exception as e:
        print(e)
        profile.errored = True
    await profile.save()
