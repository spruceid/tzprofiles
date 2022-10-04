FROM dipdup/dipdup:6.1.3
COPY pyproject.toml poetry.lock ./
RUN inject_pyproject
COPY . .
