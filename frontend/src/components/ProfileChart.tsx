import Plot from "react-plotly.js";

import type {
  Data,
  Layout,
  Config,
} from "plotly.js";

import type {
  FloatObservation,
} from "../types";


interface ProfileChartProps {
  observations: FloatObservation[];

  parameter?:
    | "temperature_c"
    | "salinity_psu"
    | "oxygen_umol_kg";
}


type ProfileParameter =
  | "temperature_c"
  | "salinity_psu"
  | "oxygen_umol_kg";


export default function ProfileChart({
  observations,
  parameter = "temperature_c",
}: ProfileChartProps) {

  /*
  |--------------------------------------------------------------------------
  | Sort observations by depth
  |--------------------------------------------------------------------------
  */

  const ordered =
    [...observations].sort(
      (a, b) =>
        a.depth_m -
        b.depth_m
    );


  /*
  |--------------------------------------------------------------------------
  | Parameter configuration
  |--------------------------------------------------------------------------
  */

  const configuration: Record<
    ProfileParameter,
    {
      title: string;
      unit: string;
    }
  > = {

    temperature_c: {
      title: "Temperature",
      unit: "°C",
    },

    salinity_psu: {
      title: "Salinity",
      unit: "PSU",
    },

    oxygen_umol_kg: {
      title: "Oxygen",
      unit: "µmol/kg",
    },
  };


  const config =
    configuration[parameter];


  /*
  |--------------------------------------------------------------------------
  | Get selected parameter value
  |--------------------------------------------------------------------------
  */

  function getValue(
    row: FloatObservation
  ): number {

    switch (parameter) {

      case "salinity_psu":
        return Number(
          row.salinity_psu ?? 0
        );

      case "oxygen_umol_kg":
        return Number(
          row.oxygen_umol_kg ?? 0
        );

      case "temperature_c":
      default:
        return Number(
          row.temperature_c ?? 0
        );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Chart data
  |--------------------------------------------------------------------------
  */

  const values =
    ordered.map(
      getValue
    );


  const depths =
    ordered.map(
      row =>
        Number(
          row.depth_m
        )
    );


  /*
  |--------------------------------------------------------------------------
  | Empty state
  |--------------------------------------------------------------------------
  */

  if (
    ordered.length === 0
  ) {

    return (
      <div className="empty-state">

        <p>
          No profile data available.
        </p>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Plotly data
  |--------------------------------------------------------------------------
  */

  const plotData: Data[] = [
    {
      x: values,

      y: depths,

      type: "scatter",

      mode: "lines+markers",

      name: config.title,

      line: {
        width: 2,
      },

      marker: {
        size: 6,
      },

      hovertemplate:
        `${config.title}: %{x:.3f} ${config.unit}` +
        "<br>Depth: %{y:.1f} m" +
        "<extra></extra>",
    },
  ];


  /*
  |--------------------------------------------------------------------------
  | Plotly layout
  |--------------------------------------------------------------------------
  */

  const plotLayout: Partial<Layout> = {

    autosize: true,

    margin: {
      l: 65,
      r: 20,
      t: 20,
      b: 55,
    },

    paper_bgcolor:
      "rgba(0,0,0,0)",

    plot_bgcolor:
      "rgba(0,0,0,0)",

    font: {
      family:
        "Inter, sans-serif",
    },

    xaxis: {

      title: {
        text:
          `${config.title} (${config.unit})`,
      },

      gridcolor:
        "rgba(148,163,184,0.15)",
    },

    yaxis: {

      title: {
        text:
          "Depth (m)",
      },

      autorange:
        "reversed",

      gridcolor:
        "rgba(148,163,184,0.15)",
    },

    showlegend:
      false,

    hovermode:
      "closest",
  };


  /*
  |--------------------------------------------------------------------------
  | Plotly config
  |--------------------------------------------------------------------------
  */

  const plotConfig: Partial<Config> = {

    responsive: true,

    displayModeBar: false,
  };


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="chart-container">

      <Plot

        data={
          plotData
        }

        layout={
          plotLayout
        }

        config={
          plotConfig
        }

        useResizeHandler

        style={{
          width: "100%",
          height: "100%",
        }}

      />

    </div>
  );
}