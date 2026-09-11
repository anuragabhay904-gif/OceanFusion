from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from sqlalchemy import select

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.domain.models import (
    FloatObservation,
)

from app.domain.schemas import (
    BiodiversityRecordOut,
    ChatRequest,
    ChatResponse,
    CorrelationOut,
    FloatObservationOut,
)

from app.ingestion.argo import (
    ingest_argo_netcdf,
)

from app.ingestion.edna import (
    ingest_edna_csv,
)

from app.repositories.observations import (
    list_biodiversity,
    list_float_observations,
)

from app.services.analytics import (
    biodiversity_metrics,
    correlation,
)

from app.services.chat import (
    ChatService,
)


router = APIRouter()

chat_service = ChatService()


@router.get("/health")
def health():

    return {
        "status": "ok",
        "service": "oceanfusion-api",
    }


@router.get("/ready")
def ready(
    db: Session = Depends(get_db),
):

    db.execute(select(1))

    return {
        "status": "ready"
    }


@router.get(
    "/floats",
    response_model=list[
        FloatObservationOut
    ],
)
def floats(

    float_id: str | None = None,

    start: datetime | None = None,

    end: datetime | None = None,

    limit: int = 500,

    db: Session = Depends(get_db),
):

    return list_float_observations(
        db=db,
        float_id=float_id,
        start=start,
        end=end,
        limit=min(limit, 5000),
    )


@router.get(
    "/floats/{float_id}/profile",
    response_model=list[
        FloatObservationOut
    ],
)
def profile(

    float_id: str,

    db: Session = Depends(get_db),
):

    rows = list_float_observations(
        db,
        float_id=float_id,
        limit=5000,
    )

    if not rows:

        raise HTTPException(
            status_code=404,
            detail="Float not found",
        )

    return rows


@router.get(
    "/biodiversity/records",
    response_model=list[
        BiodiversityRecordOut
    ],
)
def biodiversity(

    taxon: str | None = None,

    limit: int = 500,

    db: Session = Depends(get_db),
):

    return list_biodiversity(
        db,
        taxon=taxon,
        limit=min(limit, 5000),
    )


@router.get(
    "/biodiversity/metrics"
)
def metrics(
    db: Session = Depends(get_db),
):

    return biodiversity_metrics(
        db
    )


@router.get(
    "/analytics/correlation",
    response_model=CorrelationOut,
)
def analytics_correlation(

    ocean_parameter: str = "salinity_psu",

    radius_km: float = 100,

    temporal_window_days: int = 30,

    db: Session = Depends(get_db),
):

    supported_parameters = {
        "salinity_psu",
        "temperature_c",
        "oxygen_umol_kg",
    }

    if ocean_parameter not in supported_parameters:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported ocean parameter"
            ),
        )

    return correlation(
        db=db,
        radius_km=radius_km,
        temporal_window_days=(
            temporal_window_days
        ),
        ocean_parameter=ocean_parameter,
    )


@router.post(
    "/chat/query",
    response_model=ChatResponse,
)
def query(
    request: ChatRequest,
    db: Session = Depends(get_db),
):

    return chat_service.answer(
        db=db,
        message=request.message,
        session_id=request.session_id,
    )


@router.post("/ingest/argo")
async def ingest_argo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    temporary_path = (
        f"/tmp/{file.filename}"
    )

    with open(
        temporary_path,
        "wb",
    ) as output:

        output.write(
            await file.read()
        )

    try:

        count = ingest_argo_netcdf(
            temporary_path,
            db,
        )

        return {
            "status": "ingested",
            "records": count,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@router.post("/ingest/edna")
async def ingest_edna(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    temporary_path = (
        f"/tmp/{file.filename}"
    )

    with open(
        temporary_path,
        "wb",
    ) as output:

        output.write(
            await file.read()
        )

    try:

        count = ingest_edna_csv(
            temporary_path,
            db,
        )

        return {
            "status": "ingested",
            "records": count,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )