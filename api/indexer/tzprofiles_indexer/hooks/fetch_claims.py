from contextlib import suppress
from typing import cast

from dipdup.context import HookContext

import tzprofiles_indexer.models as models
from tzprofiles_indexer.datasource import TZPDatasource


async def fetch_claims(
    ctx: HookContext,
) -> None:
    if (tzp := ctx.datasources.get('tzp')) is None:
        raise RuntimeError('`tzp` datasource is missing')
    tzp = cast(TZPDatasource, tzp)

    async for profile in models.TZProfile.filter(valid_claims__isnull=True):
        ctx.logger.info('Fetching claims for %s', profile.contract)
        with suppress(Exception):
            claims = await tzp.resolve(profile.contract)
            profile.valid_claims = claims["valid"]
            profile.invalid_claims = claims["invalid"]
            await profile.save()
