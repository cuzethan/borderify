from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import AuthUser, get_current_user

CurrentUser = Annotated[AuthUser, Depends(get_current_user)]

projects_router = APIRouter(prefix="/projects", tags=["projects"])


@projects_router.get("")
async def list_projects(current_user: CurrentUser) -> dict[str, Any]:
    # TODO: Replace with DB query filtered by current_user.user_id.
    return {"projects": [], "owner_id": current_user.user_id}


@projects_router.post("", status_code=status.HTTP_201_CREATED)
async def create_project(
    current_user: CurrentUser,
    payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    # TODO: Validate with Pydantic schema + persist to DB.
    project_name = (payload or {}).get("name")
    return {
        "id": "TODO_DB_PROJECT_ID",
        "name": project_name,
        "owner_id": current_user.user_id,
    }


@projects_router.get("/{project_id}")
async def get_project(project_id: str, current_user: CurrentUser) -> dict[str, Any]:
    # TODO: Fetch by (project_id, current_user.user_id). Return 404 if missing.
    if project_id == "missing":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return {
        "id": project_id,
        "owner_id": current_user.user_id,
        "photos": [],
        "latest_states": [],
    }
