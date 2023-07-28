import asyncio
from typing import cast

from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction

import tzprofiles_indexer.models as models
from tzprofiles_indexer.handlers import save_claims
from tzprofiles_indexer.types.tzprofile.tezos_parameters.default import DefaultParameter
from tzprofiles_indexer.types.tzprofile.tezos_storage import TzprofileStorage


async def on_update(
    ctx: HandlerContext,
    tzprofile_update: TzktTransaction[DefaultParameter, TzprofileStorage],
) -> None:
    contract = cast(str, tzprofile_update.data.target_address)
    success = False
    while not success:
        async with ctx.transactions.in_transaction():
            success = True
            profile = await models.TZProfile.get(account=tzprofile_update.storage.owner)
            if profile.contract == contract:
                await save_claims(profile, tzprofile_update.storage.claims)
        if not success:
            await asyncio.sleep(1)
