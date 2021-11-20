import asyncio
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

    while True:
        async for profile in models.TZProfile.filter(fetched=False, failed=False):
            ctx.logger.info('Fetching claims for %s', profile.contract)
            try:
                claims = await tzp.resolve(profile.contract)
                profile.valid_claims = claims["valid"]
                profile.invalid_claims = claims["invalid"]
                profile.fetched = True  # type: ignore
            except Exception:
                ctx.logger.exception('Failed to load profile from TZP API')
                profile.failed = True  # type: ignore
            await profile.save()

        ctx.logger.info('No claims to fetch, sleeping 5 seconds')
        await asyncio.sleep(5)