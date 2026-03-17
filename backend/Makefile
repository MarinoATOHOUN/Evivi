# Makefile for Evivi API

.PHONY: help install migrate run test lint format shell superuser clean

help:
	@echo "Available commands:"
	@echo "  make install     - Install dependencies"
	@echo "  make migrate     - Run database migrations"
	@echo "  make run         - Start development server"
	@echo "  make test        - Run tests"
	@echo "  make lint        - Run linter"
	@echo "  make format      - Format code"
	@echo "  make shell       - Open Django shell"
	@echo "  make superuser   - Create superuser"
	@echo "  make clean       - Clean cache files"
	@echo "  make setup       - Full setup (install + migrate + superuser)"

install:
	pip install -r requirements.txt

migrate:
	python manage.py migrate

run:
	python manage.py runserver

test:
	python manage.py test

lint:
	flake8 .
	pylint **/*.py

format:
	black .
	isort .

shell:
	python manage.py shell

superuser:
	python manage.py createsuperuser

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".coverage" -delete

setup: install migrate
	@echo "Setup complete! Run 'make superuser' to create an admin user."

# Database commands
db-reset:
	python manage.py flush
	python manage.py migrate

db-backup:
	python manage.py dumpdata > backup.json

db-restore:
	python manage.py loaddata backup.json

# Static files
collectstatic:
	python manage.py collectstatic --noinput

# Development helpers
run-plus:
	python manage.py runserver_plus --print-sql

shell-plus:
	python manage.py shell_plus --print-sql

# Documentation
serve-docs:
	python manage.py runserver &
	@echo "Swagger UI: http://localhost:8000/api/docs/"
