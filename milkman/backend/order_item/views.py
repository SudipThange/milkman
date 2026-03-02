from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import OrderItem
from .serializers import OrderItemSerializer


# CREATE + LIST API
class OrderItemListCreateAPIView(APIView):
    """
    GET  -> List all order items
    POST -> Create new order item
    """

    # GET: List all order items
    def get(self, request):
        order_items = OrderItem.objects.all()
        serializer = OrderItemSerializer(order_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST: Create new order item
    def post(self, request):
        serializer = OrderItemSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()  # save() will auto calculate price & total
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# RETRIEVE + UPDATE + DELETE API
class OrderItemDetailAPIView(APIView):
    """
    GET    -> Retrieve single order item
    PUT    -> Update order item
    DELETE -> Delete order item
    """

    # Helper method to get object
    def get_object(self, pk):
        return get_object_or_404(OrderItem, pk=pk)

    # GET: Retrieve single order item
    def get(self, request, pk):
        order_item = self.get_object(pk)
        serializer = OrderItemSerializer(order_item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # PUT: Update order item
    def put(self, request, pk):
        order_item = self.get_object(pk)
        serializer = OrderItemSerializer(order_item, data=request.data)

        if serializer.is_valid():
            serializer.save()  # recalculates total
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE: Delete order item
    def delete(self, request, pk):
        order_item = self.get_object(pk)
        order_item.delete()
        return Response(
            {"message": "Order item deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )