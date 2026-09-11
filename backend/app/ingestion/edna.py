import csv
from datetime import datetime

from sqlalchemy.orm import Session

from app.domain.models import (
    BiodiversityRecord,
)


REQUIRED_COLUMNS = {
    "sample_id",
    "sampled_at",
    "latitude",
    "longitude",
    "depth_m",
    "taxon_name",
    "abundance",
}


def ingest_edna_csv(
    path: str,
    db: Session,
    dataset_name: str = "edna_csv",
) -> int:

    with open(
        path,
        newline="",
        encoding="utf-8",
    ) as file:

        reader = csv.DictReader(file)

        missing = (
            REQUIRED_COLUMNS
            - set(reader.fieldnames or [])
        )

        if missing:

            raise ValueError(
                f"Missing eDNA columns: "
                f"{sorted(missing)}"
            )

        count = 0

        for row in reader:

            confidence = None

            if row.get(
                "classification_confidence"
            ):

                confidence = float(
                    row[
                        "classification_confidence"
                    ]
                )

            record = BiodiversityRecord(

                sample_id=row[
                    "sample_id"
                ],

                sampled_at=datetime.fromisoformat(
                    row["sampled_at"]
                ),

                latitude=float(
                    row["latitude"]
                ),

                longitude=float(
                    row["longitude"]
                ),

                depth_m=float(
                    row["depth_m"]
                ),

                taxon_name=row[
                    "taxon_name"
                ],

                taxon_rank=row.get(
                    "taxon_rank",
                    "species",
                ),

                abundance=int(
                    row["abundance"]
                ),

                sequence_id=(
                    row.get("sequence_id")
                    or None
                ),

                classification_confidence=confidence,

                source_dataset=dataset_name,
            )

            db.add(record)

            count += 1

    db.commit()

    return count