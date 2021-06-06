import os
import requests

TZP_API = os.environ["TZP_API"]


# TODO need an infinite number of retries?
def resolve_tzp(owner):
    payload = {"invalid": "true", "valid": "true"}
    url = TZP_API + "/" + owner
    return requests.get(url, params=payload).json()
