from typing import cast
from tzprofiles_indexer.handlers.on_configure import TZPDatasource
from dipdup.models import Origination
from dipdup.context import HandlerContext

import tzprofiles_indexer.models as models

from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage


async def on_origination(
    ctx: HandlerContext,
    tzprofile_origination: Origination[TzprofileStorage],
) -> None:
    if (tzp := ctx.datasources.get('tzp')) is None:
        raise RuntimeError('`tzp` datasource is missing')
    tzp = cast(TZPDatasource, tzp)

    originated_contract = cast(str, tzprofile_origination.data.originated_contract_address)
    profile, created = await models.TZProfile.get_or_create(
        account=tzprofile_origination.storage.owner,
        defaults={
            "contract": originated_contract,
            "valid_claims": [],
            "invalid_claims": [],
            "errored": False,
        },
    )
    if created:
        try:
            claims = await tzp.resolve(originated_contract)
            profile.valid_claims = claims["valid"]
            profile.invalid_claims = claims["invalid"]
        except Exception as e:
            ctx.logger.error(e)
            profile.errored = True  # type: ignore
        await profile.save()
