.ONESHELL:
.DEFAULT_GOAL: all

DEV=1
TAG=latest

all: install lint test cover
lint: isort black flake mypy

install:
	poetry install `if [ "${DEV}" = "0" ]; then echo "--no-dev"; fi`

isort:
	poetry run isort tzprofiles_indexer tests

black:
	poetry run black tzprofiles_indexer tests

flake:
	poetry run flakehell lint tzprofiles_indexer tests

mypy:
	poetry run mypy tzprofiles_indexer tests

test:
	poetry run python -m unittest tests

cover:

build:
	poetry build

up:
	docker-compose -f docker-compose.local.yml up -d db hasura

down:
	docker-compose -f docker-compose.local.yml down -v 
