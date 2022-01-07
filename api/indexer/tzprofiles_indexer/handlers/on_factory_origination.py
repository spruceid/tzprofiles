from typing import cast

from dipdup.context import HandlerContext
from dipdup.models import Origination

import tzprofiles_indexer.models as models
from tzprofiles_indexer.handlers import save_claims
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

    profile, _ = await models.TZProfile.get_or_create(
        account=tzprofile_origination.storage.owner,
        defaults={"contract": tzprofile_origination.data.originated_contract_address},
    )
    await save_claims(profile, tzprofile_origination.storage.claims)
