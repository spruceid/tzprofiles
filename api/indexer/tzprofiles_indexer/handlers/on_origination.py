from dipdup.models import Origination
from dipdup.context import HandlerContext

import tzprofiles_indexer.models as models

from tzprofiles_indexer.types.tzprofile.storage import TzprofileStorage
from tzprofiles_indexer.handlers import resolve_tzp


async def on_origination(
    ctx: HandlerContext,
    tzprofile_origination: Origination[TzprofileStorage],
) -> None:
    profile, created = await models.TZProfile.get_or_create(
        account=tzprofile_origination.storage.owner,
        defaults={
            "contract": tzprofile_origination.data.originated_contract_address,
            "valid_claims": [],
            "invalid_claims": [],
            "errored": False,
        },
    )
    if created:
        try:
            claims = await resolve_tzp(
                tzprofile_origination.data.originated_contract_address
            )
            profile.valid_claims = claims["valid"]
            profile.invalid_claims = claims["invalid"]
        except Exception as e:
            print(e)
            profile.errored = True
        await profile.save()
