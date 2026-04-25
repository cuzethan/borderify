from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import AuthUser, get_current_user

CurrentUser = Annotated[AuthUser, Depends(get_current_user)]

photos_router = APIRouter(prefix="/api/photos", tags=["photos"])


@photos_router.post("/{photo_id}/states", status_code=status.HTTP_201_CREATED)
async def create_photo_state(
    photo_id: str,
    current_user: CurrentUser,
    payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    # TODO: Verify photo ownership via join on projects.user_id, then insert state.
    transform_json = (payload or {}).get("transform_json", {})
    return {
        "photo_id": photo_id,
        "version": 1,
        "transform_json": transform_json,
        "owner_id": current_user.user_id,
    }


@photos_router.get("/{photo_id}/states/latest")
async def get_latest_photo_state(photo_id: str, current_user: CurrentUser) -> dict[str, Any]:
    # TODO: Verify ownership and read latest state from DB.
    if photo_id == "missing":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")

    return {
        "photo_id": photo_id,
        "version": 1,
        "transform_json": {},
        "owner_id": current_user.user_id,
    }
