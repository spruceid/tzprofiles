from dipdup.models import (
    OperationData,
    OperationHandlerContext,
    OriginationContext,
    TransactionContext,
)

import tzprofiles_indexer.models as models

from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage
from tzprofiles_indexer.handlers import TZP_API
from tzprofiles_indexer.handlers import resolve_tzp


async def on_origination(
    ctx: OperationHandlerContext,
    tzprofile_origination: OriginationContext[TzprofileStorage],
) -> None:
    profile = models.TZProfile(
        account=tzprofile_origination.storage.owner,
        contract=tzprofile_origination.data.originated_contract_address,
        valid_claims=[],
        invalid_claims=[],
        errored=False,
    )
    try:
        claims = resolve_tzp(tzprofile_origination.storage.owner)
        profile.valid_claims = claims["valid"]
        profile.invalid_claims = claims["invalid"]
    except Exception as e:
        print(e)
        profile.errored = True
    await profile.save()
