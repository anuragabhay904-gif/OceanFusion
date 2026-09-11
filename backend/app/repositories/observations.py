from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.models import (
    BiodiversityRecord,
    FloatObservation,
)


def list_float_observations(
    db: Session,
    float_id: str | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
    limit: int = 500,
):
    stmt = (
        select(FloatObservation)
        .order_by(
            FloatObservation.timestamp,
            FloatObservation.depth_m,
        )
        .limit(limit)
    )

    if float_id:
        stmt = stmt.where(
            FloatObservation.float_id == float_id
        )

    if start:
        stmt = stmt.where(
            FloatObservation.timestamp >= start
        )

    if end:
        stmt = stmt.where(
            FloatObservation.timestamp <= end
        )

    return list(db.scalars(stmt))


def list_biodiversity(
    db: Session,
    taxon: str | None = None,
    limit: int = 500,
):
    stmt = (
        select(BiodiversityRecord)
        .order_by(
            BiodiversityRecord.sampled_at
        )
        .limit(limit)
    )

    if taxon:
        stmt = stmt.where(
            BiodiversityRecord.taxon_name.ilike(
                f"%{taxon}%"
            )
        )

    return list(db.scalars(stmt))