# OceanFusion Project Scope

## In scope
- ARGO ocean data discovery: temperature, salinity, depth, float location/time
- Molecular biodiversity from eDNA records
- Taxonomic identification/classification interface
- Oceanography physical/chemical parameters
- Conversational AI and visualization
- Cross-dataset spatial/temporal analysis

## Out of scope
- Fisheries/commercial fishing data
- Aquaculture management
- Vessel tracking/maritime logistics
- Non-marine biodiversity

## Demo vs production
The repository ships with small synthetic/demo datasets so the complete workflow runs locally. Official ARGO/eDNA ingestion adapters are included as extension points; production taxonomy identification should use validated reference databases and domain pipelines rather than treating the demo similarity classifier as scientific ground truth.
