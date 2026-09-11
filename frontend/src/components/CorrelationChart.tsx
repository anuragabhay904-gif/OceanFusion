import {
  Activity,
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react";

import type {
  CorrelationResult,
} from "../types";


interface CorrelationChartProps {
  result: CorrelationResult;
}


/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

function getStrength(
  coefficient: number | null
): string {
  if (coefficient === null) {
    return "Unavailable";
  }

  const absolute =
    Math.abs(coefficient);

  if (absolute >= 0.7) {
    return "Strong";
  }

  if (absolute >= 0.4) {
    return "Moderate";
  }

  if (absolute >= 0.2) {
    return "Weak";
  }

  return "Very weak";
}


function getDirection(
  coefficient: number | null
): string {
  if (coefficient === null) {
    return "No measurable relationship";
  }

  if (coefficient > 0.05) {
    return "Positive association";
  }

  if (coefficient < -0.05) {
    return "Negative association";
  }

  return "Near-zero association";
}


function formatParameter(
  parameter: string
): string {

  const names: Record<
    string,
    string
  > = {
    salinity_psu:
      "Salinity",

    temperature_c:
      "Temperature",

    oxygen_umol_kg:
      "Dissolved Oxygen",

    shannon_diversity:
      "Shannon Diversity",
  };


  return (
    names[parameter] ??
    parameter
  );
}


/*
|--------------------------------------------------------------------------
| Main component
|--------------------------------------------------------------------------
*/

export default function CorrelationChart({
  result,
}: CorrelationChartProps) {

  const coefficient =
    result.coefficient;


  const strength =
    getStrength(
      coefficient
    );


  const direction =
    getDirection(
      coefficient
    );


  const normalized =
    coefficient === null
      ? 0
      : Math.max(
          -1,
          Math.min(
            1,
            coefficient
          )
        );


  /*
  |--------------------------------------------------------------------------
  | Position on -1 → +1 scale
  |--------------------------------------------------------------------------
  */

  const percentage =
    ((normalized + 1) / 2) * 100;


  return (
    <div className="correlation-card">

      {/* ================================================================
          HEADER
      ================================================================ */}

      <div className="correlation-header">

        <div className="correlation-title">

          <div className="correlation-icon">
            <Activity
              size={17}
            />
          </div>

          <div>

            <div className="panel-eyebrow">
              STATISTICAL RELATIONSHIP
            </div>

            <h3>
              {formatParameter(
                result.x_parameter
              )}
              {" "}
              vs{" "}
              {formatParameter(
                result.y_parameter
              )}
            </h3>

          </div>

        </div>


        <div className="correlation-method">
          {result.method}
        </div>

      </div>


      {/* ================================================================
          MAIN VALUE
      ================================================================ */}

      <div className="correlation-main">

        <div className="correlation-number">

          {coefficient === null
            ? "—"
            : coefficient.toFixed(3)}

        </div>


        <div className="correlation-summary">

          <div className="correlation-direction">

            {coefficient === null ? (
              <Minus size={15} />
            ) : coefficient > 0 ? (
              <ArrowUp size={15} />
            ) : coefficient < 0 ? (
              <ArrowDown size={15} />
            ) : (
              <Minus size={15} />
            )}

            <span>
              {direction}
            </span>

          </div>


          <div className="correlation-strength">
            {strength} relationship
          </div>

        </div>

      </div>


      {/* ================================================================
          SCALE
      ================================================================ */}

      <div className="correlation-scale">

        <div className="scale-labels">

          <span>
            −1.0
          </span>

          <span>
            0
          </span>

          <span>
            +1.0
          </span>

        </div>


        <div className="scale-track">

          <div className="scale-negative" />

          <div className="scale-neutral" />

          <div className="scale-positive" />


          {coefficient !== null && (
            <div
              className="scale-marker"
              style={{
                left:
                  `${percentage}%`,
              }}
            >
              <div className="scale-marker-dot" />

              <span>
                {coefficient.toFixed(
                  2
                )}
              </span>
            </div>
          )}

        </div>

      </div>


      {/* ================================================================
          INTERPRETATION
      ================================================================ */}

      <div className="correlation-interpretation">

        <div className="interpretation-label">
          INTERPRETATION
        </div>

        <p>
          {result.interpretation}
        </p>

      </div>


      {/* ================================================================
          METADATA
      ================================================================ */}

      <div className="correlation-metadata">

        <div className="correlation-meta-item">

          <span>
            Matched Samples
          </span>

          <strong>
            {result.sample_count}
          </strong>

        </div>


        <div className="correlation-meta-item">

          <span>
            Spatial Radius
          </span>

          <strong>
            {result.spatial_radius_km}
            {" "}
            km
          </strong>

        </div>


        <div className="correlation-meta-item">

          <span>
            Temporal Window
          </span>

          <strong>
            {result.temporal_window_days}
            {" "}
            days
          </strong>

        </div>

      </div>


      {/* ================================================================
          DISCLAIMER
      ================================================================ */}

      <div className="correlation-note">

        Correlation indicates statistical
        association between matched observations;
        it does not establish causation.

      </div>

    </div>
  );
}