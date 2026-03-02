from rest_framework import serializers
from .models import Subscriber


class SubscriberSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)
    user_email = serializers.SerializerMethodField(read_only=True)
    subscription_title = serializers.SerializerMethodField(read_only=True)
    subscription_price = serializers.SerializerMethodField(read_only=True)
    subscription_duration = serializers.SerializerMethodField(read_only=True)
    subscription_quantity = serializers.SerializerMethodField(read_only=True)
    payment_status = serializers.SerializerMethodField(read_only=True)
    payment_method = serializers.SerializerMethodField(read_only=True)
    transaction_id = serializers.SerializerMethodField(read_only=True)
    payment_order_id = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Subscriber
        fields = [
            "id",
            "user",
            "user_name",
            "user_email",
            "subscription",
            "subscription_title",
            "subscription_price",
            "subscription_duration",
            "subscription_quantity",
            "subscription_date",
            "due_date",
            "payment_status",
            "payment_method",
            "transaction_id",
            "payment_order_id",
        ]
        read_only_fields = ("id", "due_date", "user")

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["user"] = request.user
        return super().create(validated_data)

    def validate(self, data):
        request = self.context.get("request")
        user = self.instance.user if self.instance else getattr(request, "user", None)
        subscription = data.get("subscription")
        if not subscription and self.instance:
            subscription = self.instance.subscription

        if not user or not subscription:
            return data

        # Handle update case safely
        queryset = Subscriber.objects.filter(
            user=user,
            subscription=subscription
        )

        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            raise serializers.ValidationError(
                "You already have this subscription."
            )

        return data

    def get_user_name(self, obj):
        return obj.user.username if obj.user else None

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None

    def get_subscription_title(self, obj):
        return obj.subscription.title if obj.subscription else None

    def get_subscription_price(self, obj):
        return obj.subscription.price if obj.subscription else None

    def get_subscription_duration(self, obj):
        return obj.subscription.duration if obj.subscription else None

    def get_subscription_quantity(self, obj):
        return obj.subscription.quantity if obj.subscription else None

    def _get_latest_payment_order(self, obj):
        return obj.payment_orders.order_by("-created_at").first()

    def get_payment_status(self, obj):
        latest_order = self._get_latest_payment_order(obj)
        return latest_order.payment_status if latest_order else "pending"

    def get_payment_method(self, obj):
        latest_order = self._get_latest_payment_order(obj)
        return latest_order.payment_method if latest_order else None

    def get_transaction_id(self, obj):
        latest_order = self._get_latest_payment_order(obj)
        return latest_order.transaction_id if latest_order else None

    def get_payment_order_id(self, obj):
        latest_order = self._get_latest_payment_order(obj)
        return str(latest_order.order_id) if latest_order else None
