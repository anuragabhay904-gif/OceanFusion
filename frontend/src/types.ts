/*
|--------------------------------------------------------------------------
| ARGO observation
|--------------------------------------------------------------------------
*/

export interface FloatObservation {
  float_id: string;

  timestamp: string;

  latitude: number;

  longitude: number;

  depth_m: number;

  temperature_c: number;

  salinity_psu: number;

  oxygen_umol_kg?: number | null;

  source_dataset?: string;
}


/*
|--------------------------------------------------------------------------
| eDNA biodiversity record
|--------------------------------------------------------------------------
*/

export interface BiodiversityRecord {
  sample_id: string;

  sampled_at: string;

  latitude: number;

  longitude: number;

  depth_m: number;

  taxon_name: string;

  taxon_rank: string;

  abundance: number;

  sequence_id?: string | null;

  classification_confidence?: number | null;

  source_dataset?: string;
}


/*
|--------------------------------------------------------------------------
| Biodiversity summary metrics
|--------------------------------------------------------------------------
|
| Matches backend:
| app/domain/schemas.py / analytics.py
|--------------------------------------------------------------------------
*/

export interface BiodiversityMetrics {
  species_richness: number;

  shannon_diversity: number;

  total_abundance: number;
}


/*
|--------------------------------------------------------------------------
| Correlation result
|--------------------------------------------------------------------------
*/

export interface CorrelationResult {
  x_parameter: string;

  y_parameter: string;

  coefficient: number | null;

  method: string;

  sample_count: number;

  spatial_radius_km: number;

  temporal_window_days: number;

  interpretation: string;
}


/*
|--------------------------------------------------------------------------
| Query plan
|--------------------------------------------------------------------------
*/

export interface QueryPlan {
  intent: string;

  entities?: string[];

  filters?: Record<string, unknown>;

  metric?: string | null;
}


/*
|--------------------------------------------------------------------------
| AI chart specification
|--------------------------------------------------------------------------
*/

export interface ChatChart {
  type: string;

  title: string;

  x: Array<number | string>;

  y: Array<number | string>;

  x_label?: string | null;

  y_label?: string | null;
}


/*
|--------------------------------------------------------------------------
| Chat response
|--------------------------------------------------------------------------
*/

export interface ChatResponse {
  answer: string;

  plan: QueryPlan;

  chart?: ChatChart | null;

  provenance?: string[];
}