FROM ghcr.io/dipdup-net/dipdup-py:pr-198

COPY pyproject.toml poetry.lock ./
RUN inject_pyproject

COPY tzprofiles_indexer tzprofiles_indexer