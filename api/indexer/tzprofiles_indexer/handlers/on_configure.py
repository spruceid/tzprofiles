import asyncio
from typing import Any, Dict
from dipdup.context import HandlerContext
from dipdup.datasources.datasource import Datasource
from dipdup.config import HTTPConfig
from os import environ as env

TZP_API = env.get('TZP_API', 'https://api.tzprofiles.com').rstrip('/')

# TODO: For DipDup: inject datasource classes?
class TZPDatasource(Datasource):
    async def run(self) -> None:
        await self._http.__aenter__()

    async def resolve(self, address: str) -> Dict[str, Any]:
        return await self._http.request(
            method='get',
            url=f'{self._http._url}/{address}',
            params={"invalid": "true", "valid": "true"},
        )

    def _default_http_config(self) -> HTTPConfig:
        return HTTPConfig(retry_count=0)


async def on_configure(ctx: HandlerContext) -> None:
    datasource = TZPDatasource(TZP_API)
    asyncio.create_task(datasource.run())
    ctx.datasources['tzp'] = datasource
