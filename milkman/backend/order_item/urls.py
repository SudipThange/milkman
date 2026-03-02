from django.urls import path
from .views import (
    OrderItemListCreateAPIView,
    OrderItemDetailAPIView
)

urlpatterns = [

    # List all & Create new
    path("", OrderItemListCreateAPIView.as_view(), name="orderitem-list-create"),

    # Retrieve, Update, Delete by ID
    path("<int:pk>/", OrderItemDetailAPIView.as_view(), name="orderitem-detail"),
]