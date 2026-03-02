from django.urls import path
from .views import UserView, LoginView, LogoutView, AdminUserListView

urlpatterns = [
    path("", UserView.as_view()),
    path("admin-users/", AdminUserListView.as_view()),
    path("<int:pk>/", UserView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
]
