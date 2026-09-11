from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    Index,
    Integer,
    String,
)

from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class FloatObservation(Base):
    """
    Normalized ARGO observation.

    One row represents one float/depth/time measurement.
    """

    __tablename__ = "float_observations"

    __table_args__ = (
        Index(
            "ix_float_time",
            "float_id",
            "timestamp",
        ),
        Index(
            "ix_float_geo",
            "latitude",
            "longitude",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    float_id: Mapped[str] = mapped_column(
        String(64),
        index=True,
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        index=True,
    )

    latitude: Mapped[float] = mapped_column(
        Float
    )

    longitude: Mapped[float] = mapped_column(
        Float
    )

    depth_m: Mapped[float] = mapped_column(
        Float
    )

    temperature_c: Mapped[float] = mapped_column(
        Float
    )

    salinity_psu: Mapped[float] = mapped_column(
        Float
    )

    oxygen_umol_kg: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    source_dataset: Mapped[str] = mapped_column(
        String(128),
        default="unknown",
    )


class BiodiversityRecord(Base):
    """
    Normalized eDNA biodiversity observation.
    """

    __tablename__ = "biodiversity_records"

    __table_args__ = (
        Index(
            "ix_edna_geo_time",
            "latitude",
            "longitude",
            "sampled_at",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    sample_id: Mapped[str] = mapped_column(
        String(64),
        index=True,
    )

    sampled_at: Mapped[datetime] = mapped_column(
        DateTime,
        index=True,
    )

    latitude: Mapped[float] = mapped_column(
        Float
    )

    longitude: Mapped[float] = mapped_column(
        Float
    )

    depth_m: Mapped[float] = mapped_column(
        Float
    )

    taxon_name: Mapped[str] = mapped_column(
        String(255),
        index=True,
    )

    taxon_rank: Mapped[str] = mapped_column(
        String(32),
        default="species",
    )

    abundance: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )

    sequence_id: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )

    classification_confidence: Mapped[
        float | None
    ] = mapped_column(
        Float,
        nullable=True,
    )

    source_dataset: Mapped[str] = mapped_column(
        String(128),
        default="unknown",
    )