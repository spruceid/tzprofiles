import os
import aiohttp

TZP_API = os.environ["TZP_API"]


# TODO need an infinite number of retries?
async def resolve_tzp(owner):
    payload = {"invalid": "true", "valid": "true"}
    url = TZP_API + "/" + owner
    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=payload) as response:
            return await response.json()
