from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.db import transaction
from decimal import Decimal
from django.utils import timezone
from django.apps import apps
from .models import Subscriber
from .serializers import SubscriberSerializer


# LIST + CREATE (for logged-in user only)
class SubscriberListCreateAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def _is_admin_actor(self, app_user):
        AuthUser = get_user_model()
        return AuthUser.objects.filter(
            Q(email__iexact=app_user.email) | Q(username__iexact=app_user.username),
            Q(is_superuser=True) | Q(is_staff=True),
            is_active=True,
        ).exists()

    def get(self, request):
        # Admin/staff can see all subscribers; normal users see own records.
        if self._is_admin_actor(request.user):
            subscribers = Subscriber.objects.all()
        else:
            subscribers = Subscriber.objects.filter(user=request.user)
        serializer = SubscriberSerializer(subscribers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SubscriberSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()   # user auto attached in serializer
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# RETRIEVE + DELETE
class SubscriberDetailAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def _is_admin_actor(self, app_user):
        AuthUser = get_user_model()
        return AuthUser.objects.filter(
            Q(email__iexact=app_user.email) | Q(username__iexact=app_user.username),
            Q(is_superuser=True) | Q(is_staff=True),
            is_active=True,
        ).exists()

    def get_object(self, pk, user):
        if self._is_admin_actor(user):
            return get_object_or_404(Subscriber, pk=pk)
        return get_object_or_404(Subscriber, pk=pk, user=user)

    def get(self, request, pk):
        subscriber = self.get_object(pk, request.user)
        serializer = SubscriberSerializer(subscriber)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        subscriber = self.get_object(pk, request.user)
        serializer = SubscriberSerializer(
            subscriber,
            data=request.data,
            context={"request": request},
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        subscriber = self.get_object(pk, request.user)
        subscriber.delete()
        return Response(
            {"message": "Subscription cancelled successfully"},
            status=status.HTTP_204_NO_CONTENT
        )


class SubscriberCheckoutAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def _is_admin_actor(self, app_user):
        AuthUser = get_user_model()
        return AuthUser.objects.filter(
            Q(email__iexact=app_user.email) | Q(username__iexact=app_user.username),
            Q(is_superuser=True) | Q(is_staff=True),
            is_active=True,
        ).exists()

    @transaction.atomic
    def post(self, request):
        subscriber_ids = request.data.get("subscriber_ids") or []
        payment_method = (request.data.get("payment_method") or "dummy_payment").strip()
        payment_reference = (request.data.get("payment_reference") or "").strip()

        if not isinstance(subscriber_ids, list) or not subscriber_ids:
            return Response(
                {"detail": "subscriber_ids must be a non-empty list."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subscribers_qs = Subscriber.objects.filter(id__in=subscriber_ids).select_related("subscription", "user")
        if not self._is_admin_actor(request.user):
            subscribers_qs = subscribers_qs.filter(user=request.user)

        subscribers = list(subscribers_qs)
        unique_requested_ids = set(subscriber_ids)
        if len(subscribers) != len(unique_requested_ids):
            return Response(
                {"detail": "One or more selected subscriptions are invalid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_orders = []
        skipped_subscriber_ids = []

        for subscriber in subscribers:
            already_paid = subscriber.payment_orders.filter(payment_status="success").exists()
            if already_paid:
                skipped_subscriber_ids.append(subscriber.id)
                continue

            transaction_id = payment_reference or f"SUB-DUMMY-{timezone.now().strftime('%Y%m%d%H%M%S%f')}"
            if payment_reference and len(subscribers) > 1:
                transaction_id = f"{payment_reference}-{subscriber.id}"

            Order = apps.get_model("order", "Order")
            order = Order.objects.create(
                user=subscriber.user,
                subscriber=subscriber,
                total_amount=Decimal(str(subscriber.subscription.price)),
                payment_status="success",
                order_status="completed",
                payment_method=payment_method,
                transaction_id=transaction_id,
            )
            created_orders.append(order)

        if not created_orders:
            return Response(
                {
                    "detail": "Selected subscriptions are already paid.",
                    "skipped_subscriber_ids": skipped_subscriber_ids,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Subscription payment recorded successfully.",
                "paid_count": len(created_orders),
                "skipped_subscriber_ids": skipped_subscriber_ids,
                "order_ids": [str(order.order_id) for order in created_orders],
            },
            status=status.HTTP_201_CREATED,
        )
