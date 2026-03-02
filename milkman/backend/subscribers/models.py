from django.db import models
from django.utils import timezone
from datetime import timedelta
from user.models import User


class Subscriber(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="subscribed_users"
    )

    subscription = models.ForeignKey(
        "subscription.Subscription",
        on_delete=models.CASCADE,
        related_name="subscriber_plans"
    )

    subscription_date = models.DateField(default=timezone.localdate)

    due_date = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    # ---------------------------------------
    # Convert Duration Code to Days
    # ---------------------------------------
    def get_duration_days(self):
        duration_map = {
            "1m": 30,
            "2m": 60,
            "3m": 90,
            "6m": 180,
            "1y": 365,
        }
        return duration_map.get(self.subscription.duration, 0)

    # ---------------------------------------
    # Override Save Method
    # ---------------------------------------
    def save(self, *args, **kwargs):
        if not self.due_date:
            days = self.get_duration_days()
            self.due_date = self.subscription_date + timedelta(days=days)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.subscription.title}"