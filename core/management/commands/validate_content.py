from django.core.management.base import BaseCommand, CommandError

from core import content


class Command(BaseCommand):
    help = "Check every content/*.json file strictly. build.sh runs it, so a broken file fails the deploy."

    def handle(self, *args, **options):
        problems = []
        for name in content.SCHEMAS:
            try:
                items = content.load(name, strict=True)
            except content.ContentError as exc:
                problems.append(str(exc))
            else:
                self.stdout.write(f"content/{name}.json: {len(items)} item(s) OK")
        if problems:
            raise CommandError("Fix these content files before deploying:\n" + "\n".join(problems))
