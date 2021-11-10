from typing import cast

from dipdup.context import HandlerContext
from dipdup.models import Transaction

import tzprofiles_indexer.models as models
from tzprofiles_indexer.types.tzprofile.parameter.default import DefaultParameter
from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage


async def on_update(
    ctx: HandlerContext,
    tzprofile_update: Transaction[DefaultParameter, TzprofileStorage],
) -> None:
    contract = cast(str, tzprofile_update.data.target_address)
    owner = tzprofile_update.storage.owner

    ctx.logger.info(f'Profile updated: {contract}, owner {owner}')
    await models.TZProfile.filter(account=owner, contract=contract).update(fetched=False, failed=False)
