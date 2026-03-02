from django.db import models
from django.core.validators import MinValueValidator


class OrderItem(models.Model):
    """
    Model to store each product inside an order.
    """

    # Foreign Key to Order table
    order = models.ForeignKey(
        "order.Order",                 # Reference to Order model
        on_delete=models.CASCADE,
        related_name="order_items"
    )

    # Foreign Key to Product table
    product = models.ForeignKey(
        "product.Product",               # Reference to Product model
        on_delete=models.CASCADE,
        related_name="order_items"
    )

    # Quantity (default = 1)
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )

    # Product price at the time of order
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    # Total price (quantity × price)
    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True
    )

    # Automatically store created time
    created_at = models.DateTimeField(auto_now_add=True)

    # Automatically update modified time
    modified_at = models.DateTimeField(auto_now=True)

    # Override save() to auto-set price and total_price
    def save(self, *args, **kwargs):
        # Get product price automatically
        if self.product:
            self.price = self.product.price

        # Calculate total price
        self.total_price = self.quantity * self.price

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"