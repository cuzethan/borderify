from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from jose.exceptions import JWTError

from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class AuthUser:
    user_id: str
    email: str | None = None
    role: str | None = None


class JWKSCache:
    def __init__(self, jwks_url: str, ttl_seconds: int = 3600) -> None:
        self.jwks_url = jwks_url
        self.ttl_seconds = ttl_seconds
        self._jwks: dict[str, Any] | None = None
        self._expires_at = 0.0

    async def get_jwks(self) -> dict[str, Any]:
        now = time.time()
        if self._jwks is not None and now < self._expires_at:
            return self._jwks

        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(self.jwks_url)
            response.raise_for_status()
            self._jwks = response.json()
            self._expires_at = now + self.ttl_seconds
            return self._jwks


jwks_cache = JWKSCache(
    jwks_url=settings.supabase_jwks_url,
    ttl_seconds=settings.supabase_jwks_ttl_seconds,
)


def _unauthorized(detail: str = "Invalid or missing token") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthUser:
    if not settings.supabase_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SUPABASE_URL is not configured",
        )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized("Missing bearer token")

    token = credentials.credentials

    try:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        if not kid:
            raise _unauthorized("Token missing kid")

        jwks = await jwks_cache.get_jwks()
        key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)

        if key is None:
            jwks_cache._expires_at = 0
            jwks = await jwks_cache.get_jwks()
            key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
            if key is None:
                raise _unauthorized("No matching JWKS key")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.supabase_jwt_audience,
            issuer=settings.supabase_issuer,
            options={
                "verify_aud": True,
                "verify_exp": True,
                "verify_iss": True,
            },
        )
    except JWTError as exc:
        raise _unauthorized("Invalid or expired token") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to fetch auth keys",
        ) from exc

    user_id = payload.get("sub")
    if not user_id:
        raise _unauthorized("Token missing subject")

    return AuthUser(
        user_id=user_id,
        email=payload.get("email"),
        role=payload.get("role"),
    )
