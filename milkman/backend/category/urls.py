from django.urls import path
from .views import CategoryView

urlpatterns = [
    path('', CategoryView.as_view()),
    path('<int:pk>/', CategoryView.as_view()),
]