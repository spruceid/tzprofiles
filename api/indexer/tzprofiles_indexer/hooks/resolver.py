import logging
from unittest.mock import MagicMock

from dipdup.context import DipDupContext
from dipdup.context import HookContext

from tzprofiles_indexer.handlers import resolve_profile
from tzprofiles_indexer.models import TZProfile

async def resolver(
    ctx: HookContext,
) -> None:
    dipdup_ctx = DipDupContext({}, ctx.config, MagicMock())
    profiles = [profile async for profile in TZProfile.filter(resolved=False).limit(100).select_for_update()]
    for profile in profiles:
        logging.warning(f'Resolving profile {profile.contract}')
        await resolve_profile(profile)
        await profile.save()
        await dipdup_ctx.update_contract_metadata(
            network='mainnet',
            address=profile.contract,
            metadata=profile.metadata,
        )
