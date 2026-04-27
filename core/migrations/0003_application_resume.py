from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_application_github_or_experience_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="resume",
            field=models.FileField(blank=True, upload_to="resumes/"),
        ),
    ]
