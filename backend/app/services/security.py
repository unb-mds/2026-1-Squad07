import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, timedelta, timezone
import bcrypt


AUTH_SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "dev-secret-change-me")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    password_bytes = password.encode("utf-8")
    hash_bytes = password_hash.encode("utf-8")
    try:
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except ValueError:
        return False


def create_access_token(user) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "exp": int(expires_at.timestamp()),
    }

    header = {"alg": "HS256", "typ": "JWT"}
    encoded_header = _base64url_encode_json(header)
    encoded_payload = _base64url_encode_json(payload)
    signing_input = f"{encoded_header}.{encoded_payload}"
    signature = hmac.new(
        AUTH_SECRET_KEY.encode("utf-8"),
        signing_input.encode("utf-8"),
        hashlib.sha256,
    ).digest()

    return f"{signing_input}.{_base64url_encode(signature)}"


def decode_access_token(token: str) -> dict | None:
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".")
        signing_input = f"{encoded_header}.{encoded_payload}"
        expected_signature = hmac.new(
            AUTH_SECRET_KEY.encode("utf-8"),
            signing_input.encode("utf-8"),
            hashlib.sha256,
        ).digest()
        signature = _base64url_decode(encoded_signature)
        if not hmac.compare_digest(signature, expected_signature):
            return None

        header = json.loads(_base64url_decode(encoded_header))
        if header.get("alg") != "HS256":
            return None

        payload = json.loads(_base64url_decode(encoded_payload))
        expires_at = payload.get("exp")
        if not isinstance(expires_at, int):
            return None

        if datetime.now(timezone.utc).timestamp() >= expires_at:
            return None

        return payload
    except (ValueError, json.JSONDecodeError):
        return None


def _base64url_encode_json(data: dict) -> str:
    json_bytes = json.dumps(data, separators=(",", ":")).encode("utf-8")
    return _base64url_encode(json_bytes)


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _base64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}")
