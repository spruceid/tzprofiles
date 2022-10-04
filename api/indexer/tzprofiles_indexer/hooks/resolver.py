import asyncio
import time

from dipdup.context import HookContext
from dipdup.utils.database import get_connection, set_connection

from tzprofiles_indexer.handlers import resolve_profile
from tzprofiles_indexer.models import TZProfile

SLEEP = 5
BATCH = 50


async def _resolve(ctx: HookContext, profile: TZProfile):
    ctx.logger.info(f'Resolving profile {profile.contract}')

    async with ctx._transactions.in_transaction():
        profile = await profile.select_for_update().get(account=profile.account)

        started_at = time.perf_counter()
        await resolve_profile(profile)
        resolved_at = time.perf_counter()

        await profile.save()
        await ctx.update_contract_metadata(
            network='mainnet',
            address=profile.account,
            metadata=profile.metadata,
        )
        ctx.logger.debug('Resolved in %.2f, saved in %.2f seconds', resolved_at - started_at, time.perf_counter() - resolved_at)


async def resolver(
    ctx: HookContext,
) -> None:
    ctx.logger.info('Starting resolver daemon')
    while True:
        profiles = await TZProfile.filter(resolved=False).limit(BATCH).all()
        # .only('account') doesn't with dipdup wrapper of versioned data
        if not profiles:
            ctx.logger.info('No profiles to resolve, sleeping %s seconds', SLEEP)
            await asyncio.sleep(SLEEP)
            continue

        start = time.time()

        await asyncio.gather(*[_resolve(ctx, profile) for profile in profiles])

        end = time.time()
        remain = start + 1 - end
        if remain > 0:
            await asyncio.sleep(remain)
