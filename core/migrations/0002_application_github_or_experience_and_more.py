from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='application',
            name='github_or_experience',
            field=models.CharField(blank=True, max_length=500),
        ),
        migrations.AlterField(
            model_name='application',
            name='role',
            field=models.CharField(choices=[('ai_ml_research', 'AI/ML Research'), ('agent_engineering', 'Agent Engineering'), ('cognitive_modeling', 'Cognitive Modeling'), ('infrastructure', 'Research Infrastructure'), ('other', 'Other')], max_length=50),
        ),
        migrations.AlterModelOptions(
            name='application',
            options={'ordering': ['-created_at']},
        ),
    ]
