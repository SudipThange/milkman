from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from order_item.models import OrderItem
from product.models import Product
from .models import Order


class OrderLineItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_id",
            "product_name",
            "quantity",
            "price",
            "total_price",
        ]


class OrderSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    items = OrderLineItemSerializer(source="order_items", many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_id",
            "user",
            "total_amount",
            "payment_status",
            "order_status",
            "payment_method",
            "transaction_id",
            "created_at",
            "modified_at",
            "items",
        ]
        read_only_fields = [
            "id",
            "order_id",
            "user",
            "created_at",
            "modified_at",
            "items",
        ]


class CheckoutOrderItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)


class OrderCheckoutSerializer(serializers.Serializer):
    items = CheckoutOrderItemSerializer(many=True)
    payment_method = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        return value

    def validate(self, attrs):
        raw_items = attrs.get("items", [])
        product_ids = [item["product_id"] for item in raw_items]
        product_map = {product.id: product for product in Product.objects.filter(id__in=set(product_ids))}

        missing_ids = sorted(set(product_ids) - set(product_map))
        if missing_ids:
            raise serializers.ValidationError(
                {"items": [f"Invalid product_id values: {', '.join(str(pid) for pid in missing_ids)}"]}
            )

        merged_items = {}
        for item in raw_items:
            product_id = item["product_id"]
            merged_items[product_id] = merged_items.get(product_id, 0) + item["quantity"]

        attrs["product_map"] = product_map
        attrs["merged_items"] = merged_items
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get("request")
        if not request or not getattr(request, "user", None):
            raise serializers.ValidationError("Authenticated user is required.")

        merged_items = validated_data["merged_items"]
        product_map = validated_data["product_map"]

        total_amount = Decimal("0.00")
        for product_id, quantity in merged_items.items():
            total_amount += product_map[product_id].price * quantity

        payment_method = validated_data.get("payment_method") or "dummy_payment"
        transaction_id = f"DUMMY-{timezone.now().strftime('%Y%m%d%H%M%S%f')}"

        order = Order.objects.create(
            user=request.user,
            total_amount=total_amount,
            payment_status="success",
            order_status="processing",
            payment_method=payment_method,
            transaction_id=transaction_id,
        )

        for product_id, quantity in merged_items.items():
            product = product_map[product_id]
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price,
            )

        return order
