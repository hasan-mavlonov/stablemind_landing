# core/startup.py
from django.core.management import call_command
from django.db.utils import OperationalError

def run_migrations():
    try:
        call_command("migrate", interactive=False)
    except OperationalError:
        pass