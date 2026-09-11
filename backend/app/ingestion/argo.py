from datetime import datetime, timedelta
from pathlib import Path

import xarray as xr

from sqlalchemy.orm import Session

from app.domain.models import FloatObservation


def ingest_argo_netcdf(
    path: str,
    db: Session,
    dataset_name: str = "argo_netcdf",
) -> int:

    file = Path(path)

    if not file.exists():
        raise FileNotFoundError(path)

    dataset = xr.open_dataset(file)

    required = [
        "LATITUDE",
        "LONGITUDE",
        "JULD",
        "PRES",
        "TEMP",
        "PSAL",
    ]

    missing = [
        variable
        for variable in required
        if variable not in dataset
    ]

    if missing:

        raise ValueError(
            f"Missing ARGO variables: "
            f"{missing}"
        )

    float_id = str(
        dataset.attrs.get(
            "PLATFORM_NUMBER",
            file.stem,
        )
    )

    latitude = (
        dataset["LATITUDE"]
        .values
        .reshape(-1)
    )

    longitude = (
        dataset["LONGITUDE"]
        .values
        .reshape(-1)
    )

    juld = (
        dataset["JULD"]
        .values
        .reshape(-1)
    )

    pressure = (
        dataset["PRES"].values
    )

    temperature = (
        dataset["TEMP"].values
    )

    salinity = (
        dataset["PSAL"].values
    )

    count = 0

    for i in range(
        min(
            len(latitude),
            pressure.shape[0],
        )
    ):

        timestamp = (
            datetime(1950, 1, 1)
            + timedelta(
                days=float(juld[i])
            )
        )

        for level in range(
            pressure.shape[-1]
        ):

            try:

                depth = float(
                    pressure[i, level]
                )

                temp = float(
                    temperature[i, level]
                )

                salt = float(
                    salinity[i, level]
                )

            except (
                IndexError,
                TypeError,
                ValueError,
            ):

                continue

            if any(
                value != value
                for value in (
                    depth,
                    temp,
                    salt,
                )
            ):
                continue

            db.add(
                FloatObservation(
                    float_id=float_id,
                    timestamp=timestamp,
                    latitude=float(
                        latitude[i]
                    ),
                    longitude=float(
                        longitude[i]
                    ),
                    depth_m=depth,
                    temperature_c=temp,
                    salinity_psu=salt,
                    source_dataset=dataset_name,
                )
            )

            count += 1

    db.commit()

    return count