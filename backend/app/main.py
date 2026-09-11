from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.demo import router as demo_router
from app.api.ml import router as ml_router
from app.api.routers import router
from app.core.config import get_settings
from app.core.database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup/shutdown lifecycle.
    Creates database tables when the API starts.
    """
    Base.metadata.create_all(
        bind=engine
    )

    yield


settings = get_settings()


app = FastAPI(
    title="OceanFusion",
    version="0.1.0",
    description=(
        "Conversational Ocean and "
        "Molecular Biodiversity "
        "Intelligence Platform."
    ),
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------
# Existing OceanFusion API
# ------------------------------------------------------------------

app.include_router(
    router,
    prefix="/api/v1",
)


# ------------------------------------------------------------------
# Demo / seed endpoints
# ------------------------------------------------------------------

app.include_router(
    demo_router,
    prefix="/api/v1",
)


# ------------------------------------------------------------------
# Machine Learning endpoints
# ------------------------------------------------------------------

app.include_router(
    ml_router,
    prefix="/api/v1",
)