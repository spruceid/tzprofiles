# FROM dipdup/dipdup:5.0.4
FROM ghcr.io/dipdup-net/dipdup-py:pr-332

COPY pyproject.toml poetry.lock ./
RUN inject_pyproject

COPY tzprofiles_indexer tzprofiles_indexer
COPY dipdup.yml dipdup.docker.yml ./
ENTRYPOINT ["python", "-m", "tzprofiles_indexer.cli"]