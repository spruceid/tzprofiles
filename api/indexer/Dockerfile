FROM dipdup/dipdup:5.1.1
# FROM ghcr.io/dipdup-net/dipdup-py:pr-332

COPY pyproject.toml poetry.lock ./
RUN inject_pyproject

COPY tzprofiles_indexer tzprofiles_indexer
COPY dipdup.yml dipdup.docker.yml ./
ENTRYPOINT ["poetry", "run", "dipdup"]
CMD ["-c", "dipdup.yml", "run"]
