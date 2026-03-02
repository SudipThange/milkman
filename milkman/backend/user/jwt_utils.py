import base64
import hashlib
import hmac
import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Tuple, Dict, Any

from django.conf import settings


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode((data + padding).encode("ascii"))


def _sign(message: bytes, secret: str) -> str:
    signature = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).digest()
    return _b64url_encode(signature)


def generate_jwt(user_id: int, expires_minutes: int = 60) -> Tuple[str, str]:
    header = {"alg": "HS256", "typ": "JWT"}
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=expires_minutes)
    jti = str(uuid.uuid4())
    payload = {
        "user_id": user_id,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "jti": jti,
    }

    header_b64 = _b64url_encode(json.dumps(header, separators=(',', ':')).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(',', ':')).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    signature_b64 = _sign(signing_input, settings.SECRET_KEY)
    token = f"{header_b64}.{payload_b64}.{signature_b64}"
    return token, jti


class JWTError(Exception):
    pass


def decode_jwt(token: str) -> Dict[str, Any]:
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
    except ValueError:
        raise JWTError("Invalid token format")

    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    expected_sig = _sign(signing_input, settings.SECRET_KEY)
    if not hmac.compare_digest(expected_sig, signature_b64):
        raise JWTError("Invalid token signature")

    try:
        payload = json.loads(_b64url_decode(payload_b64))
    except Exception as e:
        raise JWTError(f"Invalid payload: {e}") from e

    exp = payload.get("exp")
    if exp is None or not isinstance(exp, int):
        raise JWTError("Invalid exp claim")
    now_ts = int(datetime.now(timezone.utc).timestamp())
    if now_ts >= exp:
        raise JWTError("Token expired")

    return payload

