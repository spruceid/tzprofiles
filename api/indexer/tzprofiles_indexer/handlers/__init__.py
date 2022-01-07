import os
from tzprofiles_indexer.models import TZProfile
import aiohttp
from urllib.parse import urljoin
import json
import hashlib
import logging
from tenacity import retry, stop_after_attempt, retry_if_exception_type, wait_fixed

from enum import Enum

from didkit import verify_credential


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
async def retrieve_claim(kepler_link):
    orbit_id, file_hash = tuple(kepler_link.replace("kepler://", "").replace('v0:', '').split("/"))
    url = urljoin(KEPLER_ENDPOINT, orbit_id + "/" + file_hash)
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status not in range(200, 430):
                response.raise_for_status()
            elif response.status == 404:
                raise DeletedCredential()
            return (await response.text(encoding="utf-8")).strip()


async def resolve_claim(kepler_link, checksum):
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


def validate_vc(vc, address):
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


def parse_claim(vc, profile):
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

# TODO need to handle cases where storage.owner != originator

async def resolve_profile(storage, profile):
    for claim in storage:
        if claim.string_1 != "VerifiableCredential":
            continue
        try:
            vc = await resolve_claim(claim.string_0, claim.bytes)
            validate_vc(vc, profile.account)
            profile.valid_claims += [(claim.string_0, json.dumps(vc), "VerifiableCredential")]
            parse_claim(vc, profile)
        except DeletedCredential as e:
            pass
        except (FailedChecksum, FailedVerification, Spoof, UnknownCredential) as e:
            logging.exception(e)
            if isinstance(e.vc, str):
                profile.invalid_claims += [(claim.string_0, e.vc, "VerifiableCredential")]
            else:
                profile.invalid_claims += [(claim.string_0, json.dumps(e.vc), "VerifiableCredential")]
        except Exception as e:
            logging.exception(e)
            profile.errored = True

if __name__ == "__main__":
    import asyncio
    class TestItem(object):
        def __init__(self, kepler_url, checksum):
            self.string_0 = kepler_url
            self.bytes = checksum
            self.string_1 = "VerifiableCredential"

    profile = TZProfile()
    profile.account = "tz1h68Pe9G2RNzy4PCHvGErXhBeXr33CHCSM"
    profile.valid_claims = []
    profile.invalid_claims = []
    asyncio.run(resolve_profile([TestItem("kepler://zCT5htke6yr5beimA2E3cXAmtp7LLRiC1ngnXmWHnuWoTcbZXUHg/zb38S6xPKFexetMmZ4NQ4whx5FUWvxNKbZNbtcnm85JoL5smz",
        "f58c32db1c9707c1e6af351add6fad7a8797448d264ec0b03c8294c6b754aabe"),
        TestItem("kepler://zCT5htke6yr5beimA2E3cXAmtp7LLRiC1ngnXmWHnuWoTcbZXUHg/zb38S7bFhMPrRZsRb8dxpcdbyDTRmivvg4KXv2d3RmqJiVs3X",
            "85274f9d21ef8ef00b51a1c5b2b41390f30ee6f860d035062b912de2d9443fcf"),
        TestItem("kepler://zCT5htke6yr5beimA2E3cXAmtp7LLRiC1ngnXmWHnuWoTcbZXUHg/zb38SFSPd8om2Qt5B8rdyqwgTJphgpsw6ezW9jp223q1MFXAP",
            "03b4479cf248f4d56fbc99f36d472a5e51c2ab547b98e7745740d0e8f9e9d9fd")], profile))
    print(">>>>>>>>> ", profile.account)
    print(profile.valid_claims)
    print()

    profile.account = "tz1T6BX1UEkZtUfkTX5xrxcRQP6QjrThuhPV"
    profile.valid_claims = []
    asyncio.run(resolve_profile([TestItem("kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38S7mZWo3MFjkbHMuu3uR44j6sAyqTEkBRdyWYKMJdAAqNu",
        "7a568c35f76b01380f5d710694dff661229ec0f95964b313ea5813254f26edf1"),
        TestItem("kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38SBhF6woQkZMB4G1emxJnzGRdi4MEmTgUSaaEGKDTpEUMi",
            "9c0366c8c98b4349160970a61bbad6cc8aebe07026da2e4f9802f2deb2ebad83"),
        TestItem("kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38SFykRn88NWAU6SW9GMd5JNym9NzckfAgGhagFn4CRz6qa",
            "76e0e451f11e6d1b508e605acdee92f5538269265f1326eea7c9ed12ea70a956"),
        TestItem("kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38SGSxUN6x1NTq3RnwBfR5v3uFg6XfKRrhfLgCiV8R6GM6P",
            "42129ded0a3abdb439d941aa1680b0c78703c8b76cbf12d7e85d5fe98438fffc"),
        TestItem("kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38SM7NJisPP1P6Ntm9Bpi8etSCHomry124xQkc61H6k5WMr",
            "8e0b276f6f8397e0ec5ab9296f481dd65faf34a07a3d7688f37c4105309415d5"),
        TestItem("kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38SMDBF5KLbmnAJACkBT3bv3CZLSjjJA6Z3YW6fzue53GRf",
            "77288f2c5fc8e173138ac887d8a317078d458dd84da5eb882c94588c67c1a788")], profile))
    print(">>>>>>>>> ", profile.account)
    print(profile.valid_claims)
    print()

    profile.account = "tz1a8pBqWvaZqmkbRweQ5YmTE8co7KAE9Auq"
    profile.valid_claims = []
    asyncio.run(resolve_profile([TestItem("kepler://v0:zCT5htke4tqSWrcYrXjYxAWFoa2S9Lw22aqHUM12AGPDd9hc51R2/zb38S97iJd43jao4zgxDoQBi1XiwX97x6iyicdCAw4Brwfnf7",
        "92b5a28fefefaa173b5ef9781906f4c0e9eaed3c96e420584c6c82e83d05eac1")], profile))
    print(">>>>>>>>> ", profile.account)
    print(profile.valid_claims)
    print()

    profile.account = "tz1UKmtEMzYPVm3XQRjxLwsGkUuCNQhezcEW"
    profile.valid_claims = []
    asyncio.run(resolve_profile([TestItem("kepler://zCT5htkeCmYZbxFp8RS1J4JAAecHBuY3hcHY7zDrW3esKkVykYD6/zb38S8tMLmreW4ewRceXW8FQhyJeGdn8N3MPEcTHniXwhdgDY",
        "c4633ff6510d15621c498c46edc6f47bd2ffefa136686028a207c5d0b2144acc")], profile))
    print(">>>>>>>>> ", profile.account)
    print(profile.valid_claims)
    print()

    profile.account = "tz1PkJVKiav7KF6gmLiQrnREJX4WC6munDjU"
    profile.valid_claims = []
    asyncio.run(resolve_profile([TestItem("kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38S9UCKqRRAq4a79g1kUAFrGUqsuQtrfbmEK7Quua2sdqTk",
        "4f1d862b2336a6aa41cb69332e073633a64645a1285d2968627e158bf7c5e99f"),
        TestItem("kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38SDUcHq3VaUvjmKHS54TuqrwUJFR5fP1vyP6tHv2TXPvFv", "30a2be816c27697fe397e1ef1ade2df6dd8f3afff1223c39ede914e6da2c0269"),
        TestItem("kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38SFzoPHyPk8WAEdxL8isTS82hYNTgGxPfg37K763EfPb64", "73328a2cfba184dc215a1e25741438882eca4e9e4b5fefc90e81c9e6bee77e68"),
        TestItem("kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38SKeAkgnfRNnuhQGJpkWEzh9NQmUrQ76nSHRrK8TRuAfGz", "76f9e86262c8cd04ae5bd230974b7fc22ac8ca802478083e7c470deea0d29f4e"),
        TestItem("kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38SLNjkD438xkiB7GPwL98Rp4mpijqpfRujYMRTrkrp1btC", "c3360ab42486da0026ee41aa6bef853b36d519ab7ce5acde283b1461cc8ad7ca"),
        TestItem("kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38SLpbueak4G16Ce1t75cNMnvLCSzxh747acSfHsXUTTJjv", "2cf5464c2ae8e8002ad49881768718d639c58b74312767e85d3cd21ec394a13b")], profile))
    print(">>>>>>>>> ", profile.account)
    print(json.dumps(profile.valid_claims))
    print()
