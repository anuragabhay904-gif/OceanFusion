# OceanFusion — Conversational Ocean & Molecular Biodiversity Intelligence

A hackathon-ready full-stack prototype that unifies ARGO ocean observations and eDNA biodiversity records behind one conversational AI interface.

## Included features
- Natural-language ocean/biodiversity query understanding
- Session-aware chat history
- ARGO NetCDF ingestion with `xarray` + CSV demo fallback
- Float metadata, temperature, salinity, depth and time-series APIs
- eDNA sequence ingestion and lightweight taxonomy classification interface
- Species richness + Shannon diversity calculations
- Unified location/time correlation between ocean and biodiversity observations
- Auto-generated chart specifications and interactive frontend visualizations
- Interactive map for floats and eDNA sites
- Correlation analysis: temperature/salinity vs biodiversity
- Trend/anomaly detection for ocean parameters
- PostgreSQL/TimescaleDB-ready configuration with SQLite default for demo
- Vector-search-ready taxonomy layer using TF-IDF similarity locally
- Docker Compose setup
- Seed/demo data and automated API tests

## Architecture
Frontend (React/Vite) → FastAPI → Query/Correlation/Taxonomy services → normalized repositories → ARGO + eDNA datasets.

## Quick start
### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python ../scripts/seed_demo.py
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Docker
```bash
docker compose up --build
```

## Example questions
- How does salinity correlate with species diversity?
- Show floats near 12N 72E.
- What is the average temperature at 1000 m?
- Which species were detected near float F001?
- Show biodiversity by sampling site.
- Find anomalous salinity observations.

## Important scope
In scope: ARGO ocean data, eDNA biodiversity, taxonomy, oceanographic parameters, conversational AI and visualization.
Out of scope: fisheries/commercial fishing, aquaculture management, vessel tracking/logistics, non-marine biodiversity.

## Production upgrade path
Replace the local demo repository with PostgreSQL + TimescaleDB/PostGIS, connect official ARGO GDAC ingestion, use an approved eDNA taxonomy pipeline (QIIME2/BLAST/DIAMOND depending on data and licensing), add an LLM provider with tool/function calling, and secure/authenticate the API.
