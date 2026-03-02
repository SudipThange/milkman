from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
import re


def validate_only_chars(value):
    if not re.match(r'^[A-Za-z ]+$', value):
        raise ValidationError("Title must contain only alphabets and spaces.")


class Subscription(models.Model):

    QUANTITY_CHOICES = [
        ('250ml', '250 ML'),
        ('500ml', '500 ML'),
        ('750ml', '750 ML'),
        ('1L', '1 Litre'),
        ('2L', '2 Litre'),
    ]

    DURATION_CHOICES = [
        ('7d', '7 Days'),
        ('15d', '15 Days'),
        ('1m', '1 Month'),
        ('2m', '2 Months'),
        ('3m', '3 Months'),
        ('6m', '6 Months'),
        ('1y', '1 Year'),
    ]

    title = models.CharField(
        max_length=100,
        validators=[validate_only_chars]
    )

    desc = models.TextField(max_length=600)

    quantity = models.CharField(
        max_length=10,
        choices=QUANTITY_CHOICES
    )

    duration = models.CharField(
        max_length=5,
        choices=DURATION_CHOICES
    )

    price = models.IntegerField(
        validators=[MinValueValidator(0)]
    )

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.get_quantity_display()} - {self.get_duration_display()}"