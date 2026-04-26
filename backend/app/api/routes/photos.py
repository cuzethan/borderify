from __future__ import annotations

import logging
from io import BytesIO
from typing import Annotated, Any

import cloudinary
import cloudinary.api
import cloudinary.uploader
import httpx
from cloudinary.exceptions import Error as CloudinaryError
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.core.auth import AuthUser, get_current_user
from app.core.config import settings

CurrentUser = Annotated[AuthUser, Depends(get_current_user)]

photos_router = APIRouter(prefix="/api/photos", tags=["photos"])
logger = logging.getLogger(__name__)


@photos_router.post("/sessions", status_code=status.HTTP_201_CREATED)
async def create_session(
    current_user: CurrentUser,
    payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase DB is not configured",
        )

    photos_payload = (payload or {}).get("photos")
    if photos_payload is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing photos payload")

    row = {
        "user_id": current_user.user_id,
        "photos": photos_payload,
    }
    rest_url = f"{settings.supabase_url.rstrip('/')}/rest/v1/session"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(rest_url, json=row, headers=headers)
            if response.status_code >= 400:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Supabase insert failed: {response.text}",
                )
            inserted = response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Supabase insert failed: {exc}",
        ) from exc

    inserted_row = inserted[0] if isinstance(inserted, list) and inserted else None
    return {"ok": True, "session": inserted_row}


@photos_router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_photo(
    current_user: CurrentUser,
    file: UploadFile = File(...),
    public_id: str | None = Form(default=None),
) -> dict[str, Any]:
    if not settings.cloudinary_cloud_name or not settings.cloudinary_api_key or not settings.cloudinary_api_secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Cloudinary is not configured")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image uploads are supported")

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )

    safe_user = "".join(ch for ch in current_user.user_id if ch.isalnum() or ch in ("-", "_"))
    user_folder = f"{settings.cloudinary_folder}/{safe_user}" if settings.cloudinary_folder else safe_user
    upload_public_id = public_id or f"{file.filename or 'photo'}"

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    try:
        result = cloudinary.uploader.upload(
            BytesIO(file_bytes),
            resource_type="image",
            folder=user_folder,
            public_id=upload_public_id,
            overwrite=True,
        )
    except CloudinaryError as exc:
        logger.exception("Cloudinary upload failed for user %s", current_user.user_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Cloudinary upload failed: {exc}",
        ) from exc

    return {
        "imageUrl": result.get("secure_url"),
        "cloudinaryPublicId": result.get("public_id"),
        "cloudinary": {
            "width": result.get("width"),
            "height": result.get("height"),
            "format": result.get("format"),
            "bytes": result.get("bytes"),
        },
    }


@photos_router.post("/reset-folder", status_code=status.HTTP_200_OK)
async def reset_user_folder(current_user: CurrentUser) -> dict[str, Any]:
    if not settings.cloudinary_cloud_name or not settings.cloudinary_api_key or not settings.cloudinary_api_secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Cloudinary is not configured")

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )

    safe_user = "".join(ch for ch in current_user.user_id if ch.isalnum() or ch in ("-", "_"))
    user_folder = f"{settings.cloudinary_folder}/{safe_user}" if settings.cloudinary_folder else safe_user
    prefix = f"{user_folder}/"

    try:
        # Remove all assets inside the user's folder tree.
        cloudinary.api.delete_resources_by_prefix(prefix, resource_type="image", type="upload")
        # Best effort: remove the folder itself (succeeds only when empty).
        try:
            cloudinary.api.delete_folder(user_folder)
        except CloudinaryError:
            pass
    except CloudinaryError as exc:
        logger.exception("Cloudinary folder reset failed for user %s", current_user.user_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Cloudinary folder reset failed: {exc}",
        ) from exc

    return {"ok": True, "folder": user_folder}


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
