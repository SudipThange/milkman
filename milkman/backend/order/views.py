from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q

from .models import Order
from .serializers import OrderSerializer, OrderCheckoutSerializer


def is_admin_mapped_user(app_user):
    if not app_user:
        return False

    AuthUser = get_user_model()
    username = (getattr(app_user, "username", "") or "").strip()
    email = (getattr(app_user, "email", "") or "").strip()

    lookup = Q()
    if username:
        lookup |= Q(username__iexact=username)
    if email:
        lookup |= Q(email__iexact=email)

    if not lookup:
        return False

    return AuthUser.objects.filter(
        lookup,
        Q(is_superuser=True) | Q(is_staff=True),
        is_active=True,
    ).exists()


class OrderListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.prefetch_related("order_items__product").order_by("-created_at")
        if not is_admin_mapped_user(request.user):
            orders = orders.filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = OrderCheckoutSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            order = serializer.save()
            return Response(
                {
                    "message": "Order created successfully",
                    "order": OrderSerializer(order).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderRetrieveAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        order_query = Order.objects.filter(id=pk).prefetch_related("order_items__product")
        if not is_admin_mapped_user(request.user):
            order_query = order_query.filter(user=request.user)
        order = order_query.first()
        if not order:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        order_query = Order.objects.filter(id=pk)
        if not is_admin_mapped_user(request.user):
            order_query = order_query.filter(user=request.user)
        order = get_object_or_404(order_query)

        serializer = OrderSerializer(
            order,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Order updated successfully"},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        order_query = Order.objects.filter(id=pk)
        if not is_admin_mapped_user(request.user):
            order_query = order_query.filter(user=request.user)
        order = get_object_or_404(order_query)
        order.delete()
        return Response(
            {"message": "Order deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )


class OrderUpdateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        order_query = Order.objects.filter(id=pk)
        if not is_admin_mapped_user(request.user):
            order_query = order_query.filter(user=request.user)
        order = get_object_or_404(order_query)

        serializer = OrderSerializer(
            order,
            data=request.data,
            partial=True  # allow partial update
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Order updated successfully"},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        order_query = Order.objects.filter(id=pk)
        if not is_admin_mapped_user(request.user):
            order_query = order_query.filter(user=request.user)
        order = get_object_or_404(order_query)
        order.delete()
        return Response(
            {"message": "Order deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
