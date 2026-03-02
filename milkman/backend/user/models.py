from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator

class User(models.Model):
    username = models.CharField(max_length=150, unique=True)  # Required
    email = models.EmailField(unique=True)  # Required
    password = models.CharField(max_length=255)  # Required

    age = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(120)],
        null=True,
        blank=True
    )

    gender = models.CharField(
        max_length=6,
        choices=[('male', 'Male'), ('female', 'Female')],
        null=True,
        blank=True
    )

    phone = models.CharField(
        max_length=10,
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message="Phone number must be 10 digits"
            )
        ],
        null=True,
        blank=True
    )

    address = models.TextField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username + ", " + self.email

    @property
    def is_authenticated(self):
        return True


class BlacklistedToken(models.Model):
    jti = models.CharField(max_length=64, unique=True)
    blacklisted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.jti