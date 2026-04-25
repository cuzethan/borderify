from fastapi import APIRouter, Depends

from app.core.auth import AuthUser, get_current_user

system_router = APIRouter(prefix="/api", tags=["system"])


@system_router.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@system_router.get("/me")
async def me(current_user: AuthUser = Depends(get_current_user)) -> dict[str, str | None]:
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "role": current_user.role,
    }
