from datetime import (
    datetime,
    timedelta,
)

import math

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.domain.models import (
    BiodiversityRecord,
    FloatObservation,
)


router = APIRouter()


@router.post("/demo/bootstrap")
def bootstrap(
    db: Session = Depends(get_db),
):

    existing = (
        db.query(FloatObservation)
        .count()
    )

    if existing:

        return {
            "status":
                "already_initialized"
        }

    taxa = [
        "Prochlorococcus marinus",
        "Emiliania huxleyi",
        "Thalassiosira oceanica",
        "Synechococcus sp.",
        "Pelagibacter ubique",
    ]

    start = datetime(
        2025,
        1,
        10,
    )

    for float_number in range(10):

        latitude = (
            10
            + float_number * 0.4
        )

        longitude = (
            70
            + float_number * 0.35
        )

        timestamp = (
            start
            + timedelta(
                days=float_number * 12
            )
        )

        for level in range(12):

            depth = level * 75

            temperature = (
                27
                - depth * 0.018
                + math.sin(
                    float_number
                ) * 0.2
            )

            salinity = (
                34.5
                + depth * 0.003
                + math.cos(
                    float_number
                ) * 0.08
            )

            oxygen = (
                210
                - depth * 0.35
            )

            db.add(
                FloatObservation(
                    float_id=(
                        f"OF-"
                        f"{1001 + float_number}"
                    ),
                    timestamp=timestamp,
                    latitude=latitude,
                    longitude=longitude,
                    depth_m=depth,
                    temperature_c=round(
                        temperature,
                        4,
                    ),
                    salinity_psu=round(
                        salinity,
                        4,
                    ),
                    oxygen_umol_kg=oxygen,
                    source_dataset=(
                        "oceanfusion-demo-argo"
                    ),
                )
            )

        for index, taxon in enumerate(
            taxa
        ):

            db.add(
                BiodiversityRecord(

                    sample_id=(
                        f"EDNA-"
                        f"{float_number:03d}"
                    ),

                    sampled_at=(
                        timestamp
                        + timedelta(
                            days=index % 2
                        )
                    ),

                    latitude=(
                        latitude + 0.03
                    ),

                    longitude=(
                        longitude + 0.02
                    ),

                    depth_m=(
                        50 + index * 20
                    ),

                    taxon_name=taxon,

                    taxon_rank="species",

                    abundance=(
                        5
                        + (
                            (
                                float_number
                                + index
                            )
                            % 7
                        )
                        * 3
                    ),

                    sequence_id=(
                        f"SEQ-"
                        f"{float_number:03d}-"
                        f"{index:02d}"
                    ),

                    classification_confidence=(
                        0.92
                        - index * 0.03
                    ),

                    source_dataset=(
                        "oceanfusion-demo-edna"
                    ),
                )
            )

    db.commit()

    return {
        "status": "initialized",

        "float_observations":
            db.query(
                FloatObservation
            ).count(),

        "biodiversity_records":
            db.query(
                BiodiversityRecord
            ).count(),
    }