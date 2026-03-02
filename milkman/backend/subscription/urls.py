from django.urls import path
from .views import (
    SubscriptionListCreateAPIView,
    SubscriptionDetailAPIView
)

urlpatterns = [
    path(
        '',
        SubscriptionListCreateAPIView.as_view(),
    ),

    path(
        "<int:pk>/",
        SubscriptionDetailAPIView.as_view(),
    ),
]