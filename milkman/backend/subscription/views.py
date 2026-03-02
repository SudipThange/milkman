from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Subscription
from .serializers import SubscriptionSerializer
from django.shortcuts import get_object_or_404


# LIST + CREATE
class SubscriptionListCreateAPIView(APIView):
    def get(self, request):
        subscriptions = Subscription.objects.all()
        serializer = SubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# RETRIEVE + UPDATE + DELETE
class SubscriptionDetailAPIView(APIView):

    def get_object(self, pk):
        return get_object_or_404(Subscription, pk=pk)

    def get(self, request, pk):
        subscription = self.get_object(pk)
        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        subscription = self.get_object(pk)
        serializer = SubscriptionSerializer(subscription, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        subscription = self.get_object(pk)
        subscription.delete()
        return Response(
            {"message": "Subscription deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )