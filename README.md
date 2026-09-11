OceanFusion — Conversational Ocean & Molecular Biodiversity Intelligence

A full-stack research prototype that brings ARGO ocean observations, eDNA biodiversity records, spatial-temporal matching, biodiversity analytics, visualization, and biodiversity prediction into one interface.

OceanFusion is designed around a simple idea: oceanographic and biodiversity data are valuable individually, but become much more useful when they can be explored together. The platform normalizes the two data domains, exposes them through a FastAPI backend, and provides a React + TypeScript interface for exploration, conversational querying, maps, profiles, correlation analysis, and machine-learning inference.

The project scope is deliberately focused on ARGO ocean data, marine molecular biodiversity, oceanographic parameters, conversational analysis, and cross-dataset spatial/temporal relationships. Fisheries, aquaculture management, vessel tracking/logistics, and non-marine biodiversity are outside the current scope.

Why OceanFusion?

Scientific ocean data is often fragmented across different datasets and tools. A researcher may need to inspect ocean conditions, find biodiversity observations, match them by location and time, calculate biodiversity metrics, and then analyze relationships between the two domains.

OceanFusion turns that workflow into a single data-intelligence pipeline:

Natural-language question / dashboard action
                    │
                    ▼
          Query planning / intent detection
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     ARGO data            eDNA records
          │                   │
          └─────────┬─────────┘
                    ▼
       Spatial + temporal matching
                    │
                    ▼
        Metrics / correlation / ML
                    │
                    ▼
       Charts + maps + explanations

The intended users are ocean researchers, marine biodiversity researchers, students/academics, and policymakers.

What the current prototype does

Conversational query layer

OceanFusion accepts natural-language questions and converts them into a validated domain-level query plan. The current implementation uses a deterministic, provider-neutral QueryPlanner; an external LLM is not required to run the prototype.

Examples:

How does salinity correlate with biodiversity?

Show ARGO depth profile

Show temperature by depth

What biodiversity is in the loaded dataset?

Find ocean observations

The query planner detects intent, entities, parameters, and a small set of numeric filters before the corresponding domain service executes the request.

ARGO ocean data

The backend supports ARGO-style NetCDF ingestion through xarray and normalizes observations into a relational schema containing:

float ID

timestamp

latitude / longitude

depth

temperature

salinity

oxygen

source dataset

A CSV/demo workflow is also included in the repository.

eDNA / biodiversity data

The system ingests already-classified biodiversity records rather than performing raw sequencing analysis. Records include sample ID, sampling time, location, depth, taxon, abundance, optional sequence ID, and classification confidence.

This distinction is important: the current project demonstrates biodiversity-data integration and analysis, not a validated raw-read taxonomic pipeline. The project scope explicitly positions production taxonomy pipelines as a future/extension concern.

Spatial-temporal matching

OceanFusion links biodiversity samples to compatible ocean observations using both geography and time.

Current defaults:

Spatial radius: 100 km

Temporal window: 30 days

Geographic distance: Haversine formula

For each biodiversity sample, compatible ARGO observations are filtered by both constraints, and the nearest compatible ocean observation is used for the correlation workflow. These values and the spatial/temporal matching rationale are also part of the project's stated design.

Biodiversity analytics

The current analytics layer calculates:

Species richness — number of unique taxa

Shannon diversity — diversity based on taxon abundance distribution

Total abundance

Shannon diversity is computed from the abundance distribution in the loaded records.

Correlation analysis

OceanFusion can compare an ocean parameter with Shannon diversity after spatial-temporal matching.

Supported ocean parameters:

Salinity (salinity_psu)

Temperature (temperature_c)

Oxygen (oxygen_umol_kg)

The current implementation uses Pearson correlation. Results are intentionally treated as exploratory associations, not causal conclusions.

Interactive visualization

The frontend includes:

ARGO float map

depth/profile charts

correlation charts

biodiversity metrics panel

biodiversity prediction panel

tabular data views

conversational query interface

The frontend is built with React, TypeScript, Plotly, Leaflet, and react-leaflet.

Biodiversity prediction model

The repository includes a saved ExtraTreesRegressor model that predicts Shannon diversity from:

latitude
longitude
depth_m
temperature_c
salinity_psu
oxygen_umol_kg

The training pipeline uses a grouped train/test split based on rounded 1-degree latitude/longitude cells and reports the following held-out metrics from the included model metadata:

Metric

Value

Training rows

5,276

Test rows

1,580

Total rows

6,856

MAE

0.1238

RMSE

0.1634

R²

0.4324

The training source recorded in the model metadata is Tara Oceans PANGAEA biodiversity + depth-specific environmental context, with source DOIs 10.1594/PANGAEA.853809 and 10.1594/PANGAEA.853810.

This model should be presented as a prototype research model, not as validated ecological forecasting or causal inference.

Architecture

                         React + TypeScript
                                │
                     REST / JSON over HTTP
                                │
                                ▼
                          FastAPI backend
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
        ▼                       ▼                        ▼
   Query planner          Domain services           ML endpoint
        │                       │                        │
        ▼             ┌─────────┴─────────┐              ▼
 Conversational       │                   │       ExtraTrees model
 intent / filters     ▼                   ▼
                 ARGO repository     eDNA repository
                       │                   │
                       └─────────┬─────────┘
                                 ▼
                       SQLite / SQLAlchemy
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
          ARGO / NetCDF                     eDNA / CSV
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                     Spatial-temporal analytics
                                 │
                                 ▼
                        Maps / charts / metrics

The backend is organized into API, services, repositories, domain models/schemas, ingestion, and ML modules, reflecting separation of concerns. This is consistent with the project's stated architecture.

Tech stack

Frontend

React 18

TypeScript

Vite

Leaflet / React Leaflet

Plotly / React Plotly

Lucide React

Backend

Python

FastAPI

Pydantic / pydantic-settings

SQLAlchemy

SQLite for the current demo configuration

PostgreSQL driver support is present for future deployment

Scientific / data layer

NumPy

Pandas

SciPy

Xarray

NetCDF4

Machine learning

scikit-learn

ExtraTreesRegressor

Joblib model artifact

Dev / deployment

Pytest

Docker

Docker Compose

Nginx for the frontend container

Repository structure

OceanFusion/
├── backend/
│   ├── app/
│   │   ├── api/            # REST endpoints
│   │   ├── core/           # configuration + database setup
│   │   ├── domain/         # ORM models + Pydantic schemas
│   │   ├── ingestion/      # ARGO NetCDF + eDNA CSV ingestion
│   │   ├── ml/             # biodiversity prediction model
│   │   ├── repositories/   # database access
│   │   └── services/       # query planning, chat, analytics
│   ├── models/             # saved ML artifact + metrics
│   ├── data/processed/     # processed ML training data
│   ├── scripts/            # training/data preparation scripts
│   ├── tests/              # API + query planner tests
│   ├── Dockerfile
│   └── requirements.txt
│
├── data/
│   ├── argo/               # demo ARGO data
│   └── edna/               # demo biodiversity data
│
├── docs/
│   └── PROJECT_SCOPE.md
│
├── frontend/
│   ├── src/
│   │   ├── components/     # dashboard components
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── Dockerfile
│   └── package.json
│
├── scripts/
│   └── seed_demo.py
│
├── docker-compose.yml
├── .gitignore
└── README.md

Quick start — local development

1. Clone the repository

git clone https://github.com/<your-username>/OceanFusion.git
cd OceanFusion

2. Backend

cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install scikit-learn joblib

The extra scikit-learn and joblib installation is required by the current saved-model inference module; these packages should also be added to backend/requirements.txt for a fully reproducible fresh clone.

Start the API on port 8001 because the current frontend API client points to http://127.0.0.1:8001/api/v1:

uvicorn app.main:app --reload --port 8001

API documentation:

Swagger UI: http://127.0.0.1:8001/docs

ReDoc: http://127.0.0.1:8001/redoc

Health: http://127.0.0.1:8001/api/v1/health

3. Bootstrap the demo dataset

The repository's demo bootstrap endpoint creates a small, deterministic dataset for local exploration:

curl -X POST http://127.0.0.1:8001/api/v1/demo/bootstrap

The built-in demo generator creates 10 float tracks with 12 depth observations each (120 ocean observations) and 50 biodiversity records.

4. Frontend

In a second terminal:

cd frontend
npm install
npm run dev

Open:

http://localhost:5173

Docker

The repository includes Dockerfiles for both services and a docker-compose.yml.

docker compose up --build

The compose file exposes:

Frontend: http://localhost:5173

Backend: http://localhost:8000

Docker configuration note

The current frontend API client is hard-coded to port 8001, while Docker Compose exposes the backend on port 8000. Before relying on the Compose deployment unchanged, align the frontend API base URL with the container/network configuration. This is a configuration issue in the current repository, not a README assumption.

API overview

Method

Endpoint

Purpose

GET

/api/v1/health

Health check

GET

/api/v1/ready

Database readiness check

GET

/api/v1/floats

List ARGO observations

GET

/api/v1/floats/{float_id}/profile

Retrieve one float profile

GET

/api/v1/biodiversity/records

List biodiversity records

GET

/api/v1/biodiversity/metrics

Species richness, Shannon diversity, total abundance

GET

/api/v1/analytics/correlation

Ocean parameter vs. Shannon diversity correlation

POST

/api/v1/chat/query

Natural-language query planning + domain response

POST

/api/v1/demo/bootstrap

Create demo data

POST

/api/v1/ingest/argo

Ingest ARGO NetCDF

POST

/api/v1/ingest/edna

Ingest eDNA CSV

GET

/api/v1/ml/biodiversity/model

ML model metadata

POST

/api/v1/ml/biodiversity/predict

Predict Shannon diversity

Example queries

Try questions such as:

How does salinity correlate with biodiversity?
Show ARGO depth profile
Show temperature by depth
Show salinity by depth
What biodiversity is available?
Find ocean observations

Correlation queries use the spatial-temporal join and Pearson correlation implemented by the backend.

Data model

Float observation

float_id
 timestamp
 latitude
 longitude
 depth_m
 temperature_c
 salinity_psu
 oxygen_umol_kg
 source_dataset

Biodiversity record

sample_id
sampled_at
latitude
longitude
depth_m
taxon_name
taxon_rank
abundance
sequence_id
classification_confidence
source_dataset

The normalized representation allows the backend to perform the same analytical operations regardless of the upstream storage format.

Machine-learning workflow

The included model pipeline uses real training data assembled from Tara Oceans biodiversity and depth-specific environmental context.

Tara Oceans biodiversity + environmental records
                    │
                    ▼
             Data preparation
                    │
                    ▼
        Physical sanity / missing-data checks
                    │
                    ▼
            Grouped train / test split
                    │
                    ▼
             ExtraTreesRegressor
                    │
                    ▼
           Validation metrics
                    │
                    ▼
       Refit on all available real rows
                    │
                    ▼
     biodiversity_model.joblib artifact

Prediction target:

Shannon diversity

Model features:

latitude
longitude
depth_m
temperature_c
salinity_psu
oxygen_umol_kg

The project should not be interpreted as claiming that ocean parameters causally determine biodiversity. The project's own viva guidance emphasizes that correlation is exploratory and that ecological causality requires additional variables and controlled study design.

Scientific interpretation

OceanFusion intentionally separates data retrieval from language interpretation. The intended architecture is for a conversational layer to turn a user's question into a structured query plan, while the backend retrieves and calculates the actual values. This protects the numerical results from being invented by a language model.

The same principle applies to the current deterministic planner: natural-language input is mapped to a controlled set of intents and parameters, and the domain services perform the actual computation.

For the biodiversity relationship analysis:

Match biodiversity samples to nearby ocean observations.

Apply the temporal window.

Select the nearest compatible ocean observation.

Calculate Shannon diversity from biodiversity abundance values.

Compute Pearson correlation with the selected ocean parameter.

Return the coefficient, sample count, method, and interpretation.

A strong correlation must not be presented as proof of causality.

Testing

Run the backend tests from the backend directory:

pytest

Current tests cover, among other things:

API health endpoint

correlation intent planning

depth-profile intent planning

Current limitations

OceanFusion is a prototype and several components are intentionally scoped for demonstration:

The query planner is deterministic rather than backed by a live LLM.

Raw eDNA sequencing is not processed; the system ingests classified biodiversity records.

The included demo dataset is small and synthetic.

The current database default is SQLite rather than a production time-series database.

Correlation analysis is exploratory and does not establish causation.

The ML model is a prototype predictor and should not be treated as validated ecological forecasting.

The current frontend API base URL and Docker backend port need to be aligned for a clean Compose deployment.

backend/requirements.txt should explicitly include scikit-learn and joblib for reproducible ML inference setup.

The project documentation also identifies PostgreSQL/TimescaleDB, production ARGO ingestion, validated taxonomy pipelines, an LLM provider, and authentication/security as natural production upgrades.

Future roadmap

Planned directions include:

real-time ARGO streaming and live monitoring

stronger transformer/LLM-based query understanding

multilingual conversational support

voice interaction

production-scale PostgreSQL + TimescaleDB/PostGIS deployment

validated eDNA taxonomy workflows

richer retrieval and semantic search

authenticated multi-user deployment

Real-time streaming, advanced query understanding, multilingual support, and voice interaction are explicitly identified in the project notes as future scope.

Scope

In scope

ARGO ocean data discovery

temperature, salinity, depth, oxygen, location, and time analysis

molecular biodiversity records from eDNA workflows

taxonomy-oriented biodiversity exploration

conversational query planning

maps and scientific visualizations

cross-dataset spatial-temporal analysis

biodiversity metrics

exploratory correlation analysis

prototype biodiversity prediction

Out of scope

commercial fishing / fisheries management

aquaculture management

vessel tracking and maritime logistics

non-marine biodiversity

This scope is deliberately defined in the project documentation.

Research positioning

OceanFusion is best described as a domain-specific data intelligence platform rather than a general-purpose chatbot. Its value comes from connecting the conversational layer to structured oceanographic and biodiversity data, executing reproducible analytics, and presenting the results through domain-specific visualizations. This distinction is part of the project's intended positioning against generic LLM interfaces.

Team / attribution

Add the project team, institution, hackathon name, and contact links here before final submission.

License

No license is currently declared in the repository. Add an appropriate LICENSE file before treating the project as an open-source release.

Acknowledgements / data references

The model-training metadata records the following PANGAEA sources:

Biodiversity source: 10.1594/PANGAEA.853809

Environmental source: 10.1594/PANGAEA.853810

For a production scientific release, preserve the relevant dataset citations, licenses, and provenance requirements from the upstream data providers.
