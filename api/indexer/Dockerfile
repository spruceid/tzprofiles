FROM dipdup:latest

COPY pyproject.toml poetry.lock ./
RUN inject_pyproject

COPY tzprofiles_indexer tzprofiles_indexer