FROM dipdup/dipdup:5.1.4
COPY pyproject.toml poetry.lock ./
RUN inject_pyproject
COPY . .
