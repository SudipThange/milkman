from django.urls import path
from .views import (
    OrderListCreateAPIView,
    OrderRetrieveAPIView,
    OrderUpdateAPIView,
    OrderDeleteAPIView
)

urlpatterns = [
    path('', OrderListCreateAPIView.as_view()),
    path('<int:pk>/', OrderRetrieveAPIView.as_view()),
    path('update/<int:pk>/', OrderUpdateAPIView.as_view()),
    path('delete/<int:pk>/', OrderDeleteAPIView.as_view()),
]
