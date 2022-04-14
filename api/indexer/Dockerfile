FROM dipdup/dipdup:5.0.1
    
COPY pyproject.toml poetry.lock ./
RUN inject_pyproject

COPY tzprofiles_indexer tzprofiles_indexer
COPY dipdup.yml dipdup.prod.yml ./
ENTRYPOINT ["python", "-m", "tzprofiles_indexer.cli"]