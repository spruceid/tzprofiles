from typing import cast

from dipdup.context import HandlerContext
from dipdup.models import Origination

import tzprofiles_indexer.models as models
from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage


async def on_origination(
    ctx: HandlerContext,
    tzprofile_origination: Origination[TzprofileStorage],
) -> None:
    contract = cast(str, tzprofile_origination.data.originated_contract_address)
    owner = tzprofile_origination.storage.owner

    ctx.logger.info('Profile created: %s, owner %s', contract, owner)
    await models.TZProfile(account=owner, contract=contract).save()
