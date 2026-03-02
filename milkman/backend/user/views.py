from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import User
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .jwt_utils import generate_jwt
from .models import BlacklistedToken


class UserView(APIView):
    def get_permissions(self):
        if self.request.method in ['GET', 'POST']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, pk=None):
        if pk:
            user = get_object_or_404(User, pk=pk)
            serializer = UserSerializer(user)
        else:
            # Exclude Django admin/staff accounts from normal app-user listing.
            AuthUser = get_user_model()
            admin_email_set = set(
                AuthUser.objects.filter(Q(is_superuser=True) | Q(is_staff=True))
                .exclude(email__isnull=True)
                .exclude(email__exact="")
                .values_list("email", flat=True)
            )
            admin_username_set = set(
                AuthUser.objects.filter(Q(is_superuser=True) | Q(is_staff=True))
                .values_list("username", flat=True)
            )

            users = User.objects.exclude(email__in=admin_email_set).exclude(username__in=admin_username_set)
            serializer = UserSerializer(users, many=True)

        return Response(serializer.data)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = (request.data.get("email") or request.data.get("username") or "").strip()
        password = (request.data.get("password") or "").strip()
        if not identifier or not password:
            return Response({"detail": "email/username and password required"}, status=status.HTTP_400_BAD_REQUEST)

        # First, try app-level user table login (existing behavior).
        user = User.objects.filter(email__iexact=identifier).first()
        if not user:
            user = User.objects.filter(username__iexact=identifier).first()
        if user and user.password == password:
            token, _jti = generate_jwt(user_id=user.id, expires_minutes=60)
            return Response({"token": token, "user_id": user.id}, status=status.HTTP_200_OK)

        # Fallback: allow Django superuser login and map to app-level user.
        AuthUser = get_user_model()
        admin_user = AuthUser.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier),
            Q(is_superuser=True) | Q(is_staff=True),
            is_active=True,
        ).first()

        if admin_user and admin_user.check_password(password):
            safe_email = admin_user.email or f"{admin_user.username}@admin.local"
            mapped_user, _created = User.objects.get_or_create(
                email=safe_email,
                defaults={
                    "username": admin_user.username,
                    "password": password,
                },
            )

            # Keep admin mapping in sync for subsequent logins.
            updated = False
            if mapped_user.username != admin_user.username:
                mapped_user.username = admin_user.username
                updated = True
            if mapped_user.password != password:
                mapped_user.password = password
                updated = True
            if updated:
                mapped_user.save(update_fields=["username", "password", "modified_at"])

            token, _jti = generate_jwt(user_id=mapped_user.id, expires_minutes=60)
            return Response({"token": token, "user_id": mapped_user.id}, status=status.HTTP_200_OK)

        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = getattr(request, "auth", {}) or {}
        jti = payload.get("jti")
        if not jti:
            return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        BlacklistedToken.objects.get_or_create(jti=jti)
        return Response({"detail": "Logged out"}, status=status.HTTP_200_OK)


class AdminUserListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        AuthUser = get_user_model()
        admin_users = AuthUser.objects.all().values(
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_superuser",
            "is_active",
            "last_login",
            "date_joined",
        )
        return Response(list(admin_users), status=status.HTTP_200_OK)
