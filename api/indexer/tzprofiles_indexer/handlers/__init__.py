import os
import aiohttp

TZP_API = os.environ["TZP_API"]


# TODO need an infinite number of retries?
async def resolve_tzp(contractAddress):
    payload = {"invalid": "true", "valid": "true"}
    url = TZP_API + "/" + contractAddress
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=payload) as response:
            return await response.json()
