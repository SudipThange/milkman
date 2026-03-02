from django.urls import path
from .views import (
    SubscriberListCreateAPIView,
    SubscriberDetailAPIView,
    SubscriberCheckoutAPIView,
)

urlpatterns = [
    path(
        "",
        SubscriberListCreateAPIView.as_view()
    ),

    path(
        "<int:pk>/",
        SubscriberDetailAPIView.as_view()
    ),

    path(
        "checkout/",
        SubscriberCheckoutAPIView.as_view()
    ),
]