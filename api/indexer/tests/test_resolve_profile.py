import json
from unittest import IsolatedAsyncioTestCase

from tzprofiles_indexer.handlers import resolve_profile
from tzprofiles_indexer.models import TZProfile


class ResolveProfileTest(IsolatedAsyncioTestCase):
    async def test_resolve(self) -> None:
        profile = TZProfile()
        profile.account = "tz1h68Pe9G2RNzy4PCHvGErXhBeXr33CHCSM"  # type: ignore

        await resolve_profile(profile)
        print(">>>>>>>>> ", profile.account)
        print(profile.valid_claims)
        print()

        profile.account = "tz1T6BX1UEkZtUfkTX5xrxcRQP6QjrThuhPV"  # type: ignore
        profile.unprocessed_claims = [  # type: ignore
            (
                "kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38S7mZWo3MFjkbHMuu3uR44j6sAyqTEkBRdyWYKMJdAAqNu",
                "7a568c35f76b01380f5d710694dff661229ec0f95964b313ea5813254f26edf1",
                "VerifiableCredential",
            ),
            (
                "kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38SBhF6woQkZMB4G1emxJnzGRdi4MEmTgUSaaEGKDTpEUMi",
                "9c0366c8c98b4349160970a61bbad6cc8aebe07026da2e4f9802f2deb2ebad83",
                "VerifiableCredential",
            ),
            (
                "kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38SFykRn88NWAU6SW9GMd5JNym9NzckfAgGhagFn4CRz6qa",
                "76e0e451f11e6d1b508e605acdee92f5538269265f1326eea7c9ed12ea70a956",
                "VerifiableCredential",
            ),
            (
                "kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38SGSxUN6x1NTq3RnwBfR5v3uFg6XfKRrhfLgCiV8R6GM6P",
                "42129ded0a3abdb439d941aa1680b0c78703c8b76cbf12d7e85d5fe98438fffc",
                "VerifiableCredential",
            ),
            (
                "kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38SM7NJisPP1P6Ntm9Bpi8etSCHomry124xQkc61H6k5WMr",
                "8e0b276f6f8397e0ec5ab9296f481dd65faf34a07a3d7688f37c4105309415d5",
                "VerifiableCredential",
            ),
            (
                "kepler://zCT5htkeEHyWtFvpn3e9P97DtTmgqNX16W9qVPFhH1BgzSwKjLmf/zb38SMDBF5KLbmnAJACkBT3bv3CZLSjjJA6Z3YW6fzue53GRf",
                "77288f2c5fc8e173138ac887d8a317078d458dd84da5eb882c94588c67c1a788",
                "VerifiableCredential",
            ),
        ]
        await resolve_profile(profile)
        print(">>>>>>>>> ", profile.account)
        print(profile.valid_claims)
        print()

        profile.account = "tz1a8pBqWvaZqmkbRweQ5YmTE8co7KAE9Auq"  # type: ignore
        profile.reset()
        profile.unprocessed_claims = [  # type: ignore
            (
                "kepler://v0:zCT5htke4tqSWrcYrXjYxAWFoa2S9Lw22aqHUM12AGPDd9hc51R2/zb38S97iJd43jao4zgxDoQBi1XiwX97x6iyicdCAw4Brwfnf7",
                "92b5a28fefefaa173b5ef9781906f4c0e9eaed3c96e420584c6c82e83d05eac1",
                "VerifiableCredential",
            )
        ]

        await resolve_profile(profile)
        print(">>>>>>>>> ", profile.account)
        print(profile.valid_claims)
        print()

        profile.account = "tz1UKmtEMzYPVm3XQRjxLwsGkUuCNQhezcEW"  # type: ignore
        profile.reset()
        profile.unprocessed_claims = [  # type: ignore
            (
                "kepler://zCT5htkeCmYZbxFp8RS1J4JAAecHBuY3hcHY7zDrW3esKkVykYD6/zb38S8tMLmreW4ewRceXW8FQhyJeGdn8N3MPEcTHniXwhdgDY",
                "c4633ff6510d15621c498c46edc6f47bd2ffefa136686028a207c5d0b2144acc",
                "VerifiableCredential",
            )
        ]

        await resolve_profile(profile)
        print(">>>>>>>>> ", profile.account)
        print(profile.valid_claims)
        print()

        profile.account = "tz1PkJVKiav7KF6gmLiQrnREJX4WC6munDjU"  # type: ignore
        profile.reset()
        profile.unprocessed_claims = [  # type: ignore
            (
                "kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38S9UCKqRRAq4a79g1kUAFrGUqsuQtrfbmEK7Quua2sdqTk",
                "4f1d862b2336a6aa41cb69332e073633a64645a1285d2968627e158bf7c5e99f",
                "VerifiableCredential",
            ),
            (
                "kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38SDUcHq3VaUvjmKHS54TuqrwUJFR5fP1vyP6tHv2TXPvFv",
                "30a2be816c27697fe397e1ef1ade2df6dd8f3afff1223c39ede914e6da2c0269",
                "VerifiableCredential",
            ),
            (
                "kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38SFzoPHyPk8WAEdxL8isTS82hYNTgGxPfg37K763EfPb64",
                "73328a2cfba184dc215a1e25741438882eca4e9e4b5fefc90e81c9e6bee77e68",
                "VerifiableCredential",
            ),
            (
                "kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38SKeAkgnfRNnuhQGJpkWEzh9NQmUrQ76nSHRrK8TRuAfGz",
                "76f9e86262c8cd04ae5bd230974b7fc22ac8ca802478083e7c470deea0d29f4e",
                "VerifiableCredential",
            ),
            (
                "kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38SLNjkD438xkiB7GPwL98Rp4mpijqpfRujYMRTrkrp1btC",
                "c3360ab42486da0026ee41aa6bef853b36d519ab7ce5acde283b1461cc8ad7ca",
                "VerifiableCredential",
            ),
            (
                "kepler://zCT5htke34XfmA6mLYgr88b1xzpGq2cbLkZq4FB3eMmHW1zPXz9x/zb38SLpbueak4G16Ce1t75cNMnvLCSzxh747acSfHsXUTTJjv",
                "2cf5464c2ae8e8002ad49881768718d639c58b74312767e85d3cd21ec394a13b",
                "VerifiableCredential",
            ),
        ]

        await resolve_profile(profile)
        print(">>>>>>>>> ", profile.account)
        print(json.dumps(profile.valid_claims))
        print()
