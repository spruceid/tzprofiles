from typing import Any, Dict
from dipdup.context import HandlerContext
from dipdup.datasources.datasource import Datasource
from dipdup.config import HTTPConfig
from os import environ as env

TZP_API = env['TZP_API'].rstrip('/')

# TODO: For DipDup: inject datasource classes?
class TZPDatasource(Datasource):
    async def run(self) -> None:
        pass

    async def resolve(self, address: str) -> Dict[str, Any]:
        return await self._http.request(
            method='get',
            url=f'{self._http._url}/{address}',
            params={"invalid": "true", "valid": "true"},
        )

    def _default_http_config(self) -> HTTPConfig:
        return HTTPConfig()


async def on_configure(ctx: HandlerContext) -> None:
    ctx.datasources['tzp'] = TZPDatasource(TZP_API)
