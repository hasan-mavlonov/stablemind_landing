"""Keep applicants' CVs in the database: Render's disk is wiped on every deploy and restart.

Also copies any CV file still on this server's disk into its application row.
"""
from pathlib import Path

from django.conf import settings
from django.db import migrations, models


def copy_files_into_rows(apps, schema_editor):
    Application = apps.get_model("core", "Application")
    root = (Path(settings.MEDIA_ROOT)).resolve()
    rows = (Application.objects.filter(resume_data__isnull=True)
            .exclude(resume="").exclude(resume__isnull=True))
    for application in rows.iterator():
        path = (root / application.resume.name).resolve()
        if root not in path.parents or not path.is_file():
            continue                      # already gone (a past deploy wiped it) or unsafe
        data = path.read_bytes()
        application.resume_data = data
        application.resume_name = path.name
        application.resume_size = len(data)
        application.save(update_fields=["resume_data", "resume_name", "resume_size"])


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0006_application_referral_code_userprofile"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="resume_data",
            field=models.BinaryField(blank=True, editable=False, null=True),
        ),
        migrations.AddField(
            model_name="application",
            name="resume_name",
            field=models.CharField(blank=True, editable=False, max_length=255),
        ),
        migrations.AddField(
            model_name="application",
            name="resume_size",
            field=models.PositiveIntegerField(default=0, editable=False),
        ),
        migrations.RunPython(copy_files_into_rows, migrations.RunPython.noop),
    ]
