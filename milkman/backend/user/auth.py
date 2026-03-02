from typing import Optional, Tuple

from django.utils.translation import gettext_lazy as _
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework import exceptions

from .jwt_utils import decode_jwt, JWTError
from .models import User  # type: ignore

try:
    from .models import BlacklistedToken  # type: ignore
except Exception:
    BlacklistedToken = None  # type: ignore


class JWTAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request) -> Optional[Tuple[User, dict]]:  # type: ignore[name-defined]
        auth = get_authorization_header(request).split()
        if not auth:
            return None
        if auth[0].decode().lower() != self.keyword.lower():
            return None
        if len(auth) == 1:
            raise exceptions.AuthenticationFailed(_("Invalid Authorization header. No credentials provided."))
        if len(auth) > 2:
            raise exceptions.AuthenticationFailed(_("Invalid Authorization header."))

        token = auth[1].decode()
        try:
            payload = decode_jwt(token)
        except JWTError as e:
            raise exceptions.AuthenticationFailed(_(str(e)))

        jti = payload.get("jti")
        if BlacklistedToken is not None and jti and BlacklistedToken.objects.filter(jti=jti).exists():  # type: ignore
            raise exceptions.AuthenticationFailed(_("Token has been revoked"))

        user_id = payload.get("user_id")
        if not user_id:
            raise exceptions.AuthenticationFailed(_("Invalid token payload"))
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed(_("User not found"))

        request.auth = payload
        return user, payload

