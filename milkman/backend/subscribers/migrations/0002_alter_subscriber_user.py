from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("subscribers", "0001_initial"),
        ("user", "0003_blacklistedtoken"),
    ]

    operations = [
        migrations.AlterField(
            model_name="subscriber",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="subscribed_users",
                to="user.user",
            ),
        ),
    ]
