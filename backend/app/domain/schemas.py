from datetime import datetime

from pydantic import BaseModel, Field


class FloatObservationOut(BaseModel):

    float_id: str
    timestamp: datetime

    latitude: float
    longitude: float

    depth_m: float

    temperature_c: float
    salinity_psu: float

    oxygen_umol_kg: float | None = None

    source_dataset: str


class BiodiversityRecordOut(BaseModel):

    sample_id: str
    sampled_at: datetime

    latitude: float
    longitude: float

    depth_m: float

    taxon_name: str
    taxon_rank: str

    abundance: int

    sequence_id: str | None = None

    classification_confidence: float | None = None

    source_dataset: str


class QueryPlan(BaseModel):

    intent: str

    entities: list[str] = []

    filters: dict = {}

    metric: str | None = None


class ChartSpec(BaseModel):

    type: str

    title: str

    x: list[float | str] = []

    y: list[float | str] = []

    x_label: str | None = None

    y_label: str | None = None


class ChatRequest(BaseModel):

    message: str = Field(
        min_length=2,
        max_length=4000,
    )

    session_id: str = "default"


class ChatResponse(BaseModel):

    answer: str

    plan: QueryPlan

    chart: ChartSpec | None = None

    provenance: list[str] = []


class CorrelationOut(BaseModel):

    x_parameter: str

    y_parameter: str

    coefficient: float | None

    method: str

    sample_count: int

    spatial_radius_km: float

    temporal_window_days: int

    interpretation: str