import asyncio
import time

from dipdup.context import HookContext
from dipdup.utils.database import in_global_transaction

from tzprofiles_indexer.handlers import resolve_profile
from tzprofiles_indexer.models import TZProfile

SLEEP = 5
TIMEOUT = 30
BATCH = 25


async def _resolve(ctx: HookContext, profile: TZProfile):
    ctx.logger.info(f'Resolving profile {profile.contract}')
    started_at = time.perf_counter()
    await resolve_profile(profile)
    resolved_at = time.perf_counter()

    async with in_global_transaction():
        current_updated_at = profile.updated_at
        await profile.refresh_from_db(('updated_at',))
        if current_updated_at != profile.updated_at:
            ctx.logger.warning('Profile was updated while resolving!')
            return

        await profile.save()
        await ctx.update_contract_metadata(
            network='mainnet',
            address=profile.account,
            metadata=profile.metadata,
        )
        ctx.logger.info('Resolved in %.2f, saved in %.2f seconds', resolved_at - started_at, time.perf_counter() - resolved_at)


async def resolver(
    ctx: HookContext,
) -> None:
    while True:
        profiles = await TZProfile.filter(resolved=False).limit(BATCH).all()
        if not profiles:
            ctx.logger.info('No profiles to resolve, sleeping %s seconds', SLEEP)
            await asyncio.sleep(SLEEP)
            continue

        await asyncio.gather(*[_resolve(ctx, profile) for profile in profiles])
