from typing import cast

from dipdup.context import HandlerContext
from dipdup.models import Origination

import tzprofiles_indexer.models as models
from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage


async def on_origination(
    ctx: HandlerContext,
    tzprofile_origination: Origination[TzprofileStorage],
) -> None:
    originated_contract = cast(str, tzprofile_origination.data.originated_contract_address)
    owner = tzprofile_origination.storage.owner
    ctx.logger.info(f"New profile: {originated_contract}, owner {owner}")
    await models.TZProfile.get_or_create(
        account=owner,
        defaults={
            "contract": originated_contract,
            "valid_claims": None,
            "invalid_claims": None,
        },
    )
