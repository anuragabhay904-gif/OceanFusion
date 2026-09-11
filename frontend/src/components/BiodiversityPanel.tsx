import {
  Activity,
  Dna,
  Fish,
  FlaskConical,
  Layers3,
} from "lucide-react";

import type {
  BiodiversityMetrics,
} from "../types";


interface BiodiversityPanelProps {
  metrics: BiodiversityMetrics | null;
}


export default function BiodiversityPanel({
  metrics,
}: BiodiversityPanelProps) {
  if (!metrics) {
    return (
      <div className="biodiversity-overview">
        <div className="panel biodiversity-summary">
          <div className="loading-panel">
            Loading biodiversity metrics...
          </div>
        </div>
      </div>
    );
  }


  const richness =
    metrics.species_richness;

  const shannon =
    metrics.shannon_diversity;

  const abundance =
    metrics.total_abundance;


  return (
    <div className="biodiversity-overview">

      <div className="metrics-grid biodiversity-metrics">

        {/* ============================================================
            Species richness
        ============================================================ */}

        <div className="metric-card">

          <div className="metric-icon">
            <Fish size={20} />
          </div>

          <div className="metric-content">

            <span className="metric-label">
              Species Richness
            </span>

            <strong className="metric-value">
              {richness}
            </strong>

            <span className="metric-subtitle">
              Unique taxa detected
            </span>

          </div>

        </div>


        {/* ============================================================
            Shannon diversity
        ============================================================ */}

        <div className="metric-card">

          <div className="metric-icon">
            <Activity size={20} />
          </div>

          <div className="metric-content">

            <span className="metric-label">
              Shannon Diversity
            </span>

            <strong className="metric-value">
              {shannon.toFixed(3)}
            </strong>

            <span className="metric-subtitle">
              Community diversity index
            </span>

          </div>

        </div>


        {/* ============================================================
            Total abundance
        ============================================================ */}

        <div className="metric-card">

          <div className="metric-icon">
            <Dna size={20} />
          </div>

          <div className="metric-content">

            <span className="metric-label">
              Total Abundance
            </span>

            <strong className="metric-value">
              {abundance}
            </strong>

            <span className="metric-subtitle">
              Observed molecular abundance
            </span>

          </div>

        </div>


        {/* ============================================================
            Dataset type
        ============================================================ */}

        <div className="metric-card">

          <div className="metric-icon">
            <Layers3 size={20} />
          </div>

          <div className="metric-content">

            <span className="metric-label">
              Data Modality
            </span>

            <strong className="metric-value">
              eDNA
            </strong>

            <span className="metric-subtitle">
              Molecular biodiversity records
            </span>

          </div>

        </div>

      </div>


      {/* ================================================================
          Explanation
      ================================================================ */}

      <div className="panel biodiversity-summary">

        <div className="panel-header">

          <div>

            <div className="panel-eyebrow">
              MOLECULAR ECOLOGY
            </div>

            <h2>
              Biodiversity Intelligence
            </h2>

          </div>

          <FlaskConical
            size={20}
          />

        </div>


        <div className="biodiversity-summary-content">

          <div className="biodiversity-summary-icon">
            <Dna size={27} />
          </div>


          <div>

            <h3>
              eDNA-based community analysis
            </h3>

            <p>
              OceanFusion aggregates molecular
              biodiversity records into taxonomic
              observations and computes community
              metrics such as species richness and
              Shannon diversity. These metrics can
              be compared with matched ARGO
              oceanographic observations.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}