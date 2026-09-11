from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..ml.predictor import predictor


router = APIRouter(
    prefix="/ml",
    tags=["Machine Learning"],
)


class BiodiversityPredictionRequest(BaseModel):

    latitude: float = Field(
        ...,
        ge=-90.0,
        le=90.0,
    )

    longitude: float = Field(
        ...,
        ge=-180.0,
        le=180.0,
    )

    depth_m: float = Field(
        ...,
        ge=0.0,
    )

    temperature_c: float

    salinity_psu: float = Field(
        ...,
        ge=0.0,
    )

    oxygen_umol_kg: float = Field(
        ...,
        ge=0.0,
    )


class BiodiversityPredictionResponse(BaseModel):

    predicted_shannon_diversity: float

    model: str

    model_type: str

    target: str

    training_source: str


@router.get(
    "/biodiversity/model",
)
def model_information() -> dict:
    """
    Return metadata about the loaded
    biodiversity prediction model.
    """

    return predictor.metadata()


@router.post(
    "/biodiversity/predict",
    response_model=BiodiversityPredictionResponse,
)
def predict_biodiversity(
    request: BiodiversityPredictionRequest,
) -> BiodiversityPredictionResponse:

    try:

        prediction = predictor.predict(
            latitude=request.latitude,
            longitude=request.longitude,
            depth_m=request.depth_m,
            temperature_c=request.temperature_c,
            salinity_psu=request.salinity_psu,
            oxygen_umol_kg=request.oxygen_umol_kg,
        )

        metadata = predictor.metadata()

        return BiodiversityPredictionResponse(

            predicted_shannon_diversity=round(
                prediction,
                6,
            ),

            model=metadata["model"],

            model_type=metadata["model_type"],

            target=metadata["target"],

            training_source=metadata[
                "training_source"
            ],
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Biodiversity prediction failed: "
                f"{exc}"
            ),
        ) from exc