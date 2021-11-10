import asyncio
from os import environ as env

from dipdup.config import HTTPConfig
from dipdup.context import HookContext

from tzprofiles_indexer.datasource import TZPDatasource

TZP_API = env.get('TZP_API', 'https://api.tzprofiles.com').rstrip('/')


async def on_restart(
    ctx: HookContext,
) -> None:
    datasource = TZPDatasource(TZP_API, HTTPConfig())
    asyncio.create_task(datasource.run())
    ctx.datasources['tzp'] = datasource
