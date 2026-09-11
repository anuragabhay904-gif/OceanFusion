import type {
  BiodiversityMetrics,
  ChatResponse,
  CorrelationResult,
  FloatObservation,
} from "./types";


/*
|--------------------------------------------------------------------------
| Backend configuration
|--------------------------------------------------------------------------
*/

const API_BASE =
  "http://127.0.0.1:8001/api/v1";


/*
|--------------------------------------------------------------------------
| Generic request helper
|--------------------------------------------------------------------------
*/

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  const response =
    await fetch(
      `${API_BASE}${path}`,
      {
        ...options,

        headers: {
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
        },
      }
    );


  if (!response.ok) {
  const text = await response.text();

  let message =
    `Request failed with status ${response.status}`;

  try {
    const parsed: unknown =
      JSON.parse(text);

    if (
      typeof parsed === "object" &&
      parsed !== null
    ) {
      const data =
        parsed as Record<string, unknown>;

      const detail =
        data.detail;

      if (typeof detail === "string") {
        message = detail;
      } else if (detail !== undefined) {
        message = JSON.stringify(detail);
      } else if (
        typeof data.message === "string"
      ) {
        message = data.message;
      } else {
        message = JSON.stringify(data);
      }
    } else {
      message = String(parsed);
    }

  } catch {
    if (text) {
      message = text;
    }
  }

  throw new Error(message);
}


  if (
    response.status === 204
  ) {

    return undefined as T;
  }


  return response.json() as Promise<T>;
}


/*
|--------------------------------------------------------------------------
| ARGO floats / observations
|--------------------------------------------------------------------------
|
| Backend route:
| GET /api/v1/floats
|--------------------------------------------------------------------------
*/

export async function getFloats(
  limit = 500
): Promise<FloatObservation[]> {

  const payload =
    await request<FloatObservation[]>(
      `/floats?limit=${encodeURIComponent(limit)}`
    );


  return payload;
}


/*
|--------------------------------------------------------------------------
| ARGO float profile
|--------------------------------------------------------------------------
|
| Backend route:
| GET /api/v1/floats/{float_id}/profile
|--------------------------------------------------------------------------
*/

export async function getFloatProfile(
  floatId: string
): Promise<FloatObservation[]> {

  const encodedId =
    encodeURIComponent(
      floatId
    );


  return request<FloatObservation[]>(
    `/floats/${encodedId}/profile`
  );
}


/*
|--------------------------------------------------------------------------
| Biodiversity records
|--------------------------------------------------------------------------
|
| Backend route:
| GET /api/v1/biodiversity/records
|--------------------------------------------------------------------------
*/

export async function getBiodiversityRecords(
  limit = 500
): Promise<unknown[]> {

  return request<unknown[]>(
    `/biodiversity/records?limit=${encodeURIComponent(limit)}`
  );
}


/*
|--------------------------------------------------------------------------
| Biodiversity metrics
|--------------------------------------------------------------------------
|
| Backend route:
| GET /api/v1/biodiversity/metrics
|--------------------------------------------------------------------------
*/

export async function getBiodiversityMetrics():
  Promise<BiodiversityMetrics> {

  return request<BiodiversityMetrics>(
    "/biodiversity/metrics"
  );
}


/*
|--------------------------------------------------------------------------
| Correlation
|--------------------------------------------------------------------------
|
| Backend expects:
|   ocean_parameter
|   radius_km
|   temporal_window_days
|--------------------------------------------------------------------------
*/

export async function getCorrelation(
  parameter = "salinity_psu",
  radiusKm = 100,
  temporalWindowDays = 30
): Promise<CorrelationResult> {

  const query =
    new URLSearchParams({
      ocean_parameter:
        parameter,

      radius_km:
        String(radiusKm),

      temporal_window_days:
        String(
          temporalWindowDays
        ),
    });


  return request<CorrelationResult>(
    `/analytics/correlation?${query.toString()}`
  );
}


/*
|--------------------------------------------------------------------------
| Demo bootstrap
|--------------------------------------------------------------------------
|
| Backend route:
| POST /api/v1/demo/bootstrap
|--------------------------------------------------------------------------
*/

export interface DemoBootstrapResponse {

  status: string;

  float_observations?: number;

  biodiversity_records?: number;
}


export async function bootstrapDemo():
  Promise<DemoBootstrapResponse> {

  return request<DemoBootstrapResponse>(
    "/demo/bootstrap",
    {
      method: "POST",
    }
  );
}


/*
|--------------------------------------------------------------------------
| Chat
|--------------------------------------------------------------------------
|
| Backend route:
| POST /api/v1/chat/query
|--------------------------------------------------------------------------
*/

export interface ChatQueryRequest {

  message: string;

  session_id?: string;
}


export async function sendChatQuery(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {

  return request<ChatResponse>(
    "/chat/query",
    {
      method: "POST",

      body:
        JSON.stringify({
          message,

          session_id:
            sessionId ?? null,
        }),
    }
  );
}


/*
|--------------------------------------------------------------------------
| Machine Learning
|--------------------------------------------------------------------------
|
| Backend routes:
| GET  /api/v1/ml/biodiversity/model
| POST /api/v1/ml/biodiversity/predict
|--------------------------------------------------------------------------
*/

export interface BiodiversityPredictionInput {

  latitude: number;

  longitude: number;

  depth_m: number;

  temperature_c: number;

  salinity_psu: number;

  oxygen_umol_kg: number;
}


export interface BiodiversityPrediction {

  predicted_shannon_diversity: number;

  model: string;

  model_type: string;

  target: string;

  training_source: string;
}


/*
|--------------------------------------------------------------------------
| Biodiversity ML prediction
|--------------------------------------------------------------------------
*/

export async function predictBiodiversity(
  input: BiodiversityPredictionInput
): Promise<BiodiversityPrediction> {

  return request<BiodiversityPrediction>(
    "/ml/biodiversity/predict",
    {
      method: "POST",

      body:
        JSON.stringify(input),
    }
  );
}


/*
|--------------------------------------------------------------------------
| Biodiversity model information
|--------------------------------------------------------------------------
*/

export interface BiodiversityModelInfo {

  model: string;

  model_type: string;

  model_path: string;

  features: string[];

  target: string;

  training_source: string;
}


export async function getBiodiversityModelInfo():
  Promise<BiodiversityModelInfo> {

  return request<BiodiversityModelInfo>(
    "/ml/biodiversity/model"
  );
}