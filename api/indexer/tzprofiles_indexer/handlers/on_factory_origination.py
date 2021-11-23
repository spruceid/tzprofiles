from typing import cast

from dipdup.context import HandlerContext
from dipdup.models import Origination

import tzprofiles_indexer.models as models
from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage


async def on_factory_origination(
    ctx: HandlerContext,
    tzprofile_origination: Origination[TzprofileStorage],
) -> None:
    originated_contract = cast(str, tzprofile_origination.data.originated_contract_address)
    index_name = f"tzprofiles_{originated_contract}"
    await ctx.add_contract(
        name=originated_contract,
        address=originated_contract,
        typename="tzprofile",
    )
    await ctx.add_index(
        name=index_name,
        template="tzprofiles",
        values=dict(contract=originated_contract),
    )

    owner = tzprofile_origination.storage.owner
    ctx.logger.info('Profile created: %s, owner %s', originated_contract, owner)
    await models.TZProfile(account=owner, contract=originated_contract).save()
