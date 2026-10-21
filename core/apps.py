from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Import the LLM SDK as each worker starts (best effort). It takes about a second,
        # which would otherwise land inside a visitor's first demo turn and its time budget.
        try:
            import openai  # noqa: F401
        except Exception:  # missing or broken install: the demo's offline paths still work
            pass
