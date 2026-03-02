from django.db import models
from django.core.validators import MinValueValidator
import uuid


class Order(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    ORDER_STATUS_CHOICES = [
        ('created', 'Created'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    order_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )

    user = models.ForeignKey(
        "user.User",
        on_delete=models.CASCADE,
        related_name="orders"
    )

    subscriber = models.ForeignKey(
        "subscribers.Subscriber",
        on_delete=models.SET_NULL,
        related_name="payment_orders",
        null=True,
        blank=True,
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )

    order_status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS_CHOICES,
        default='created'
    )

    payment_method = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    transaction_id = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_id} - {self.user}"
