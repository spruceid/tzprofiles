from typing import Any, Dict

from dipdup.datasources.datasource import Datasource


class TZPDatasource(Datasource):
    async def run(self) -> None:
        await self._http.__aenter__()

    async def resolve(self, address: str) -> Dict[str, Any]:
        return await self._http.request(
            method='get',
            url=f'{self._http._url}/{address}',
            params={"invalid": "true", "valid": "true"},
        )
