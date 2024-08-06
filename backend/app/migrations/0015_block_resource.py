# Generated by Django 5.0.6 on 2024-07-20 01:45

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0014_remove_blocklink_source_remove_blocklink_target_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="block",
            name="resource",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="blocks",
                to="app.resource",
            ),
        ),
    ]