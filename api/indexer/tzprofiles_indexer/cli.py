import asyncio
import logging
from contextlib import AsyncExitStack

import asyncclick as click
from dipdup.cli import cli, cli_wrapper
from dipdup.config import DipDupConfig
from dipdup.utils.database import tortoise_wrapper

from tzprofiles_indexer.handlers import resolve_profile
from tzprofiles_indexer.models import TZProfile


@cli.command(help='Run resolver')
@click.pass_context
@cli_wrapper
async def resolver(ctx):
    config: DipDupConfig = ctx.obj.config
    url = config.database.connection_string
    models = f'{config.package}.models'

    async with AsyncExitStack() as stack:
        await stack.enter_async_context(tortoise_wrapper(url, models))

        while True:
            async for profile in TZProfile.filter(resolved=False):
                logging.info(f'Resolving profile {profile.contract}')
                await resolve_profile(profile)
                await profile.save()

            await asyncio.sleep(1)
