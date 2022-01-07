import hashlib
import json
import logging
import os
from enum import Enum
from typing import Any, Dict, List
from urllib.parse import urljoin

import aiohttp
from didkit import verify_credential
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_fixed

from tzprofiles_indexer.models import TZProfile
from tzprofiles_indexer.types.tzprofile.storage import Claim

KEPLER_ENDPOINT = os.getenv("KEPLER_ENDPOINT", "https://kepler.tzprofiles.com/")


class Credential(Enum):
    BASIC_PROFILE = "BasicProfile"
    TWITTER = "TwitterVerification"
    DNS = "DnsVerification"
    DISCORD = "DiscordVerification"
    GITHUB = "GitHubVerification"
    ETHEREUM = "EthereumAddressControl"
    ETHEREUM_OLD = "EthereumControl"


class FailedChecksum(ValueError):
    def __init__(self, vc, expected_checksum, resulted_checksum, message="Failed checksum"):
        self.vc = vc
        self.expected_checksum = expected_checksum
        self.resulted_checksum = resulted_checksum
        self.message = message
        super().__init__(self.message, vc, expected_checksum, resulted_checksum)


class FailedVerification(ValueError):
    def __init__(self, vc, message):
        self.vc = vc
        self.message = message
        super().__init__(self.message, vc)


class Spoof(ValueError):
    def __init__(self, vc, message):
        self.vc = vc
        self.message = message
        super().__init__(self.message, vc)


class UnknownCredential(ValueError):
    def __init__(self, vc, message="Unknown credential type"):
        self.vc = vc
        self.message = message
        super().__init__(self.message, vc)


class DeletedCredential(ValueError):
    def __init__(self, message="Credential doesn't exist in Kepler anymore"):
        self.message = message
        super().__init__(self.message)


@retry(stop=stop_after_attempt(3), retry=retry_if_exception_type(aiohttp.ClientResponseError), wait=wait_fixed(5))
async def retrieve_claim(kepler_link: str) -> str:
    orbit_id, file_hash = tuple(kepler_link.replace("kepler://", "").replace('v0:', '').split("/"))
    url = urljoin(KEPLER_ENDPOINT, orbit_id + "/" + file_hash)
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status not in range(200, 430):
                response.raise_for_status()
            elif response.status == 404:
                raise DeletedCredential()
            return (await response.text(encoding="utf-8")).strip()


async def resolve_claim(kepler_link: str, checksum: str) -> Dict[str, Any]:
    claim = await retrieve_claim(kepler_link)

    h = hashlib.sha256()
    h.update(claim.encode())
    hash = h.hexdigest()
    if hash != checksum:
        raise FailedChecksum(claim, checksum, hash)

    verify_result = await verify_credential(claim, "{}")
    errors = json.loads(verify_result)["errors"]
    if len(errors) > 0:
        raise FailedVerification(claim, str(errors))

    claim_json = json.loads(claim)
    return claim_json


def validate_vc(vc: Dict[str, Any], address: str) -> None:
    if Credential.BASIC_PROFILE.value in vc["type"]:
        if vc["credentialSubject"]["id"] != "did:pkh:tz:" + address:
            raise Spoof(vc, "Credential subject is not the profile's owner")
        if vc["issuer"] != "did:pkh:tz:" + address:
            raise Spoof(vc, "Issuer should be profile's owner: " + vc["issuer"])
    elif (
        Credential.TWITTER.value in vc["type"]
        or Credential.DNS.value in vc["type"]
        or Credential.DISCORD.value in vc["type"]
        or Credential.GITHUB.value in vc["type"]
    ):
        if vc["credentialSubject"]["id"] != "did:pkh:tz:" + address:
            raise Spoof(vc, "Credential subject is not the profile's owner")
        if vc["issuer"] != "did:web:tzprofiles.com":
            raise Spoof(vc, "Untrusted issuer: " + vc["issuer"])
    elif Credential.ETHEREUM.value in vc["type"]:
        if vc["credentialSubject"]["sameAs"] != address:
            raise Spoof(vc, "Credential subject sameAs is not the profile's owner")
        if vc["issuer"] != "did:pkh:eth:" + vc["credentialSubject"]["address"]:
            raise Spoof(vc, "Issuer should be the credential subject")
    elif Credential.ETHEREUM_OLD.value in vc["type"]:
        if vc["credentialSubject"]["sameAs"] != address:
            raise Spoof(vc, "Credential subject sameAs is not the profile's owner")
        if vc["issuer"] != "did:pkh:eth:" + vc["credentialSubject"]["wallet"]:
            raise Spoof(vc, "Issuer should be the credential subject")
    else:
        raise UnknownCredential(vc)


def parse_claim(vc: Dict[str, Any], profile: TZProfile) -> None:
    try:
        if Credential.BASIC_PROFILE.value in vc["type"]:
            profile.alias = vc["credentialSubject"].get("alias", None)
            profile.description = vc["credentialSubject"].get("description", None)
            profile.logo = vc["credentialSubject"].get("logo", None)
            profile.website = vc["credentialSubject"].get("website", None)
        elif Credential.TWITTER.value in vc["type"]:
            profile.twitter = vc["evidence"]["handle"]
        elif Credential.DNS.value in vc["type"]:
            profile.domain_name = vc["credentialSubject"]["sameAs"].replace("dns:", "")
        elif Credential.DISCORD.value in vc["type"]:
            profile.discord = vc["evidence"]["handle"]
        elif Credential.GITHUB.value in vc["type"]:
            profile.github = vc["evidence"]["handle"]
        elif Credential.ETHEREUM.value in vc["type"]:
            profile.ethereum = vc["credentialSubject"]["address"]
        elif Credential.ETHEREUM_OLD.value in vc["type"]:
            profile.ethereum = vc["credentialSubject"]["wallet"]
    except Exception as e:
        logging.exception(e)


async def save_claims(profile: TZProfile, claims: List[Claim]) -> None:
    profile.reset()
    profile.unprocessed_claims = [(claim.string_0, claim.string_1, claim.bytes) for claim in claims]  # type: ignore
    await profile.save()


# TODO: Need to handle cases where storage.owner != originator
async def resolve_profile(profile: TZProfile) -> None:
    for claim in profile.unprocessed_claims:
        string_0, bytes_, string_1 = claim
        if string_1 != "VerifiableCredential":
            continue
        try:
            vc = await resolve_claim(string_0, bytes_)
            validate_vc(vc, profile.account)
            profile.valid_claims += [(string_0, json.dumps(vc), "VerifiableCredential")]
            parse_claim(vc, profile)
        except DeletedCredential:
            pass
        except (FailedChecksum, FailedVerification, Spoof, UnknownCredential) as e:
            logging.exception(e)
            if isinstance(e.vc, str):
                profile.invalid_claims += [(string_0, e.vc, "VerifiableCredential")]
            else:
                profile.invalid_claims += [(string_0, json.dumps(e.vc), "VerifiableCredential")]
        except Exception as e:
            logging.exception(e)
            profile.failed = True  # type: ignore
            await profile.save()
            return

    profile.unprocessed_claims = []  # type: ignore
    profile.resolved = True  # type: ignore
