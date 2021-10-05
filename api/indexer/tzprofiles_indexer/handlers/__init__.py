import os
import aiohttp
from urllib.parse import urljoin

TZP_API = os.environ["TZP_API"]


# TODO need an infinite number of retries?
async def resolve_tzp(contractAddress):
    payload = {"invalid": "true", "valid": "true"}
    url = urljoin(TZP_API, contractAddress)
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=payload) as response:
            return await response.json()
