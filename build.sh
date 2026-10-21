#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py validate_content
python manage.py collectstatic --noinput
python manage.py migrate
