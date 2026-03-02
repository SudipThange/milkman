from rest_framework import serializers
from .models import OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderItem model
    """
    order_user = serializers.StringRelatedField(source="order.user", read_only=True)

    class Meta:
        model = OrderItem

        # All fields of OrderItem
        fields = [
            "id",
            "order",
            "order_user",
            "product",
            "quantity",
            "price",
            "total_price",
            "created_at",
            "modified_at",
        ]
        read_only_fields = [
            "price",
            "total_price",
            "created_at",
            "modified_at",
        ]

    # Optional: Validate quantity
    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value
