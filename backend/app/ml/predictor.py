from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd


MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "models"
    / "biodiversity_model.joblib"
)


FEATURE_NAMES = [
    "latitude",
    "longitude",
    "depth_m",
    "temperature_c",
    "salinity_psu",
    "oxygen_umol_kg",
]


class BiodiversityPredictor:
    """
    Loads the OceanFusion biodiversity model artifact.

    The saved joblib file contains a dictionary:
        {
            "model": sklearn Pipeline,
            "features": [...],
            "target": "...",
            "model_name": "...",
            "training_source": "..."
        }
    """

    def __init__(
        self,
        model_path: Path = MODEL_PATH,
    ) -> None:

        self.model_path = Path(model_path)

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Biodiversity model not found: "
                f"{self.model_path}"
            )

        artifact = joblib.load(
            self.model_path
        )

        if not isinstance(artifact, dict):
            raise TypeError(
                "Invalid biodiversity model artifact. "
                "Expected a dictionary."
            )

        if "model" not in artifact:
            raise KeyError(
                "Model artifact does not contain "
                "the 'model' key."
            )

        self.model = artifact["model"]

        self.features = artifact.get(
            "features",
            FEATURE_NAMES,
        )

        self.target = artifact.get(
            "target",
            "shannon_diversity",
        )

        self.model_name = artifact.get(
            "model_name",
            type(self.model).__name__,
        )

        self.training_source = artifact.get(
            "training_source",
            "unknown",
        )

    def predict(
            self,
            *,
            latitude: float,
            longitude: float,
            depth_m: float,
            temperature_c: float,
            salinity_psu: float,
            oxygen_umol_kg: float,
    ) -> float:

        values = pd.DataFrame(
            [[
                latitude,
                longitude,
                depth_m,
                temperature_c,
                salinity_psu,
                oxygen_umol_kg,
            ]],
            columns=self.features,
        )

        prediction = self.model.predict(values)

        return float(prediction[0])


    def metadata(self) -> dict[str, Any]:
        return {
            "model": self.model_name,
            "model_type":
                type(self.model).__name__,
            "model_path":
                str(self.model_path),
            "features":
                list(self.features),
            "target":
                self.target,
            "training_source":
                self.training_source,
        }


predictor = BiodiversityPredictor()