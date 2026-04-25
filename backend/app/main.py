from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.photos import photos_router
from app.api.routes.projects import projects_router
from app.api.routes.system import system_router
from app.core.config import settings

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system_router)
app.include_router(projects_router)
app.include_router(photos_router)
