from collections import defaultdict
from math import (
    asin,
    cos,
    radians,
    sin,
    sqrt,
)

import numpy as np

from scipy.stats import pearsonr

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.models import (
    BiodiversityRecord,
    FloatObservation,
)


EARTH_RADIUS_KM = 6371.0088


def haversine_km(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:

    lat_delta = radians(lat2 - lat1)
    lon_delta = radians(lon2 - lon1)

    a = (
        sin(lat_delta / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(lon_delta / 2) ** 2
    )

    return (
        2
        * EARTH_RADIUS_KM
        * asin(sqrt(a))
    )


def biodiversity_metrics(
    db: Session,
) -> dict:

    rows = list(
        db.scalars(
            select(BiodiversityRecord)
        )
    )

    counts = defaultdict(int)

    for row in rows:
        counts[row.taxon_name] += row.abundance

    total = sum(counts.values())

    if total == 0:
        return {
            "species_richness": 0,
            "shannon_diversity": 0.0,
            "total_abundance": 0,
        }

    probabilities = (
        np.array(
            list(counts.values()),
            dtype=float,
        )
        / total
    )

    shannon = -(
        probabilities
        * np.log(probabilities)
    ).sum()

    return {
        "species_richness": len(counts),
        "shannon_diversity": round(
            float(shannon),
            5,
        ),
        "total_abundance": total,
    }


def correlation(
    db: Session,
    radius_km: float = 100.0,
    temporal_window_days: int = 30,
    ocean_parameter: str = "salinity_psu",
) -> dict:

    ocean_rows = list(
        db.scalars(
            select(FloatObservation)
        )
    )

    biodiversity_rows = list(
        db.scalars(
            select(BiodiversityRecord)
        )
    )

    samples = defaultdict(list)

    for row in biodiversity_rows:
        samples[row.sample_id].append(row)

    x_values = []
    y_values = []

    for records in samples.values():

        sample = records[0]

        candidates = []

        for ocean in ocean_rows:

            distance = haversine_km(
                sample.latitude,
                sample.longitude,
                ocean.latitude,
                ocean.longitude,
            )

            time_difference = (
                abs(
                    (
                        sample.sampled_at
                        - ocean.timestamp
                    ).total_seconds()
                )
                / 86400
            )

            if (
                distance <= radius_km
                and time_difference
                <= temporal_window_days
            ):
                candidates.append(ocean)

        if not candidates:
            continue

        nearest = min(
            candidates,
            key=lambda ocean:
                haversine_km(
                    sample.latitude,
                    sample.longitude,
                    ocean.latitude,
                    ocean.longitude,
                ),
        )

        counts = defaultdict(int)

        for record in records:
            counts[
                record.taxon_name
            ] += record.abundance

        total = sum(counts.values())

        probabilities = (
            np.array(
                list(counts.values()),
                dtype=float,
            )
            / total
        )

        shannon = float(
            -(
                probabilities
                * np.log(probabilities)
            ).sum()
        )

        value = getattr(
            nearest,
            ocean_parameter,
            None,
        )

        if value is None:
            continue

        x_values.append(float(value))
        y_values.append(shannon)

    coefficient = None

    if len(x_values) >= 3:

        coefficient = float(
            pearsonr(
                x_values,
                y_values,
            )[0]
        )

    if coefficient is None:

        interpretation = (
            "Insufficient matched observations "
            "for a reliable correlation."
        )

    elif coefficient > 0:

        interpretation = (
            "The matched observations show a "
            "positive association."
        )

    else:

        interpretation = (
            "The matched observations show a "
            "negative association."
        )

    return {
        "x_parameter": ocean_parameter,
        "y_parameter": "shannon_diversity",
        "coefficient": (
            round(coefficient, 5)
            if coefficient is not None
            else None
        ),
        "method": "pearson",
        "sample_count": len(x_values),
        "spatial_radius_km": radius_km,
        "temporal_window_days":
            temporal_window_days,
        "interpretation": interpretation,
    }