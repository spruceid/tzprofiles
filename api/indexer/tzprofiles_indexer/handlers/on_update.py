from typing import cast
from tzprofiles_indexer.handlers.on_configure import TZPDatasource
from dipdup.models import (
    Transaction,
)
from dipdup.context import HandlerContext

import tzprofiles_indexer.models as models

from tzprofiles_indexer.types.tzprofile.parameter.default import DefaultParameter
from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage


async def on_update(
    ctx: HandlerContext,
    tzprofile_update: Transaction[DefaultParameter, TzprofileStorage],
) -> None:
    if (tzp := ctx.datasources.get('tzp')) is None:
        raise RuntimeError('`tzp` datasource is missing')
    tzp = cast(TZPDatasource, tzp)


    target_address = cast(str, tzprofile_update.data.target_address)
    profile, _ = await models.TZProfile.get_or_create(account=tzprofile_update.storage.owner)
    try:
        claims = await tzp.resolve(target_address)
        profile.valid_claims = claims["valid"]
        profile.invalid_claims = claims["invalid"]
    except Exception as e:
        ctx.logger.error(e)
        profile.errored = True  # type: ignore
    await profile.save()
