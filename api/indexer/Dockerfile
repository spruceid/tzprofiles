FROM python:3.9-slim-buster

RUN pip install poetry

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /demo
COPY poetry.lock pyproject.toml /demo/

RUN poetry config virtualenvs.create false && poetry install --no-dev

COPY . /demo

ENTRYPOINT ["poetry", "run", "dipdup"]
CMD ["-c", "dipdup.yml", "run"]
