import {
  Activity,
  Database,
  Fish,
  FlaskConical,
  Globe2,
  RefreshCw,
  Waves,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  bootstrapDemo,
  getBiodiversityMetrics,
  getCorrelation,
  getFloatProfile,
  getFloats,
} from "./api";

import type {
  BiodiversityMetrics,
  ChatResponse,
  CorrelationResult,
  FloatObservation,
} from "./types";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MetricCard from "./components/MetricCard";
import ChatPanel from "./components/ChatPanel";
import FloatMap from "./components/FloatMap";
import ProfileChart from "./components/ProfileChart";
import CorrelationChart from "./components/CorrelationChart";
import BiodiversityPanel from "./components/BiodiversityPanel";
import BiodiversityPrediction from "./components/BiodiversityPrediction";
import DataTable from "./components/DataTable";


/*
|--------------------------------------------------------------------------
| Application views
|--------------------------------------------------------------------------
*/

type View =
  | "overview"
  | "explore"
  | "biodiversity";


/*
|--------------------------------------------------------------------------
| Supported profile parameters
|--------------------------------------------------------------------------
*/

type ProfileParameter =
  | "temperature_c"
  | "salinity_psu"
  | "oxygen_umol_kg";


/*
|--------------------------------------------------------------------------
| Validate a profile parameter
|--------------------------------------------------------------------------
*/

function isProfileParameter(
  value: unknown
): value is ProfileParameter {

  return (
    value === "temperature_c" ||
    value === "salinity_psu" ||
    value === "oxygen_umol_kg"
  );
}


/*
|--------------------------------------------------------------------------
| Application
|--------------------------------------------------------------------------
*/

export default function App() {

  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const [
    view,
    setView,
  ] = useState<View>(
    "overview"
  );


  /*
  |--------------------------------------------------------------------------
  | ARGO observations
  |--------------------------------------------------------------------------
  */

  const [
    observations,
    setObservations,
  ] = useState<
    FloatObservation[]
  >([]);


  /*
  |--------------------------------------------------------------------------
  | Selected float profile
  |--------------------------------------------------------------------------
  */

  const [
    selectedProfile,
    setSelectedProfile,
  ] = useState<
    FloatObservation[]
  >([]);


  /*
  |--------------------------------------------------------------------------
  | Current profile parameter
  |--------------------------------------------------------------------------
  */

  const [
    profileParameter,
    setProfileParameter,
  ] = useState<ProfileParameter>(
    "temperature_c"
  );


  /*
  |--------------------------------------------------------------------------
  | Selected observation used by ML
  |--------------------------------------------------------------------------
  */

  const [
    selectedObservation,
    setSelectedObservation,
  ] = useState<
    FloatObservation | null
  >(null);


  /*
  |--------------------------------------------------------------------------
  | Biodiversity metrics
  |--------------------------------------------------------------------------
  */

  const [
    biodiversity,
    setBiodiversity,
  ] = useState<
    BiodiversityMetrics | null
  >(null);


  /*
  |--------------------------------------------------------------------------
  | Correlation
  |--------------------------------------------------------------------------
  */

  const [
    correlation,
    setCorrelation,
  ] = useState<
    CorrelationResult | null
  >(null);


  /*
  |--------------------------------------------------------------------------
  | Connection state
  |--------------------------------------------------------------------------
  */

  const [
    connected,
    setConnected,
  ] = useState(false);


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  const [
    loading,
    setLoading,
  ] = useState(true);


  /*
  |--------------------------------------------------------------------------
  | Selected float
  |--------------------------------------------------------------------------
  */

  const [
    selectedFloat,
    setSelectedFloat,
  ] = useState<
    string | null
  >(null);


  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);


  /*
  |--------------------------------------------------------------------------
  | Number of unique floats
  |--------------------------------------------------------------------------
  */

  const uniqueFloats =
    useMemo(
      () =>
        new Set(
          observations.map(
            row =>
              row.float_id
          )
        ).size,
      [
        observations,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | Load dashboard data
  |--------------------------------------------------------------------------
  */

  const loadData =
    useCallback(
      async () => {

        setLoading(true);

        setError(null);


        const results =
          await Promise.allSettled([
            getFloats(500),

            getBiodiversityMetrics(),

            getCorrelation(
              "salinity_psu"
            ),
          ]);


        const [
          floatsResult,
          biodiversityResult,
          correlationResult,
        ] = results;


        /*
        |--------------------------------------------------------------------------
        | ARGO
        |--------------------------------------------------------------------------
        */

        if (
          floatsResult.status ===
          "fulfilled"
        ) {

          setObservations(
            floatsResult.value
          );

        }


        /*
        |--------------------------------------------------------------------------
        | Biodiversity
        |--------------------------------------------------------------------------
        */

        if (
          biodiversityResult.status ===
          "fulfilled"
        ) {

          setBiodiversity(
            biodiversityResult.value
          );

        }


        /*
        |--------------------------------------------------------------------------
        | Correlation
        |--------------------------------------------------------------------------
        */

        if (
          correlationResult.status ===
          "fulfilled"
        ) {

          setCorrelation(
            correlationResult.value
          );

        }


        /*
        |--------------------------------------------------------------------------
        | Connection status
        |--------------------------------------------------------------------------
        */

        const successCount =
          results.filter(
            result =>
              result.status ===
              "fulfilled"
          ).length;


        setConnected(
          successCount > 0
        );


        if (
          successCount === 0
        ) {

          setError(
            "Backend is unreachable. Start the FastAPI server and refresh."
          );

        } else if (
          successCount <
          results.length
        ) {

          setError(
            "Some analytics endpoints are unavailable."
          );

        }


        setLoading(false);

      },
      []
    );


  /*
  |--------------------------------------------------------------------------
  | Initial load
  |--------------------------------------------------------------------------
  */

  useEffect(
    () => {

      void loadData();

    },
    [
      loadData,
    ]
  );


  /*
  |--------------------------------------------------------------------------
  | Initialize demo
  |--------------------------------------------------------------------------
  */

  async function initializeDemo() {

    setLoading(true);

    setError(null);


    try {

      await bootstrapDemo();

      await loadData();

    } catch (err) {

      setConnected(false);

      setLoading(false);

      setError(
        err instanceof Error
          ? err.message
          : "Demo initialization failed."
      );

    }
  }


  /*
  |--------------------------------------------------------------------------
  | Select ARGO float
  |--------------------------------------------------------------------------
  */

  async function selectFloat(
    floatId: string
  ) {

    setSelectedFloat(
      floatId
    );


    setSelectedProfile(
      []
    );


    setSelectedObservation(
      null
    );


    setProfileParameter(
      "temperature_c"
    );


    try {

      const profile =
        await getFloatProfile(
          floatId
        );


      setSelectedProfile(
        profile
      );


      /*
      |--------------------------------------------------------------------------
      | Choose a representative valid observation for ML
      |--------------------------------------------------------------------------
      */

      const validProfile =
        profile
          .filter(
            row =>
              Number.isFinite(
                row.latitude
              ) &&
              Number.isFinite(
                row.longitude
              ) &&
              Number.isFinite(
                row.depth_m
              ) &&
              Number.isFinite(
                row.temperature_c
              ) &&
              Number.isFinite(
                row.salinity_psu
              ) &&
              Number.isFinite(
                row.oxygen_umol_kg ??
                0
              )
          )
          .sort(
            (a, b) =>
              a.depth_m -
              b.depth_m
          );


      if (
        validProfile.length >
        0
      ) {

        setSelectedObservation(
          validProfile[0]
        );

      }

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the selected float profile."
      );

    }
  }


  /*
  |--------------------------------------------------------------------------
  | Chat response
  |--------------------------------------------------------------------------
  */

  function handleChatResponse(
    response: ChatResponse
  ) {

    /*
    |--------------------------------------------------------------------------
    | Depth profile
    |--------------------------------------------------------------------------
    */

    if (
      response.plan?.intent ===
        "depth_profile"
      &&
      response.chart
    ) {

      /*
      |--------------------------------------------------------------------------
      | Safely validate metric
      |--------------------------------------------------------------------------
      */

      const requestedMetric =
        response.plan.metric;


      const parameter: ProfileParameter =
        isProfileParameter(
          requestedMetric
        )
          ? requestedMetric
          : "temperature_c";


      /*
      |--------------------------------------------------------------------------
      | Convert chatbot chart into profile observations
      |--------------------------------------------------------------------------
      */

      const synthetic:
        FloatObservation[] =
        response.chart.x.map(
          (
            depth,
            index
          ) => {

            const value =
              Number(
                response.chart?.y[
                  index
                ] ?? 0
              );


            return {

              float_id:
                "AI_QUERY",

              timestamp:
                new Date().toISOString(),

              latitude:
                0,

              longitude:
                0,

              depth_m:
                Number(depth),

              temperature_c:
                parameter ===
                "temperature_c"
                  ? value
                  : 0,

              salinity_psu:
                parameter ===
                "salinity_psu"
                  ? value
                  : 0,

              oxygen_umol_kg:
                parameter ===
                "oxygen_umol_kg"
                  ? value
                  : 0,

              source_dataset:
                "chat-query",
            };

          }
        );


      setProfileParameter(
        parameter
      );


      setSelectedFloat(
        "AI QUERY"
      );


      setSelectedObservation(
        null
      );


      setSelectedProfile(
        synthetic
      );


      setView(
        "explore"
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="app-shell">

      <Header
        connected={
          connected
        }
      />


      <div className="app-body">

        <Sidebar
          active={
            view
          }
          onChange={
            setView
          }
        />


        <main className="main-content">

          {/* =========================================================
              ERROR
          ========================================================= */}

          {error && (

            <div
              className="error-banner"
              role="alert"
            >

              <span>
                {
                  error
                }
              </span>


              <button
                type="button"
                onClick={() =>
                  setError(
                    null
                  )
                }
                aria-label="Dismiss"
              >
                ×
              </button>

            </div>

          )}


          {/* =========================================================
              OVERVIEW
          ========================================================= */}

          {view ===
            "overview" && (

            <>

              <div className="page-heading">

                <div>

                  <div className="eyebrow">
                    OCEAN INTELLIGENCE PLATFORM
                  </div>


                  <h1>
                    Ocean & Biodiversity{" "}
                    <span>
                      Intelligence
                    </span>
                  </h1>


                  <p>
                    Explore ARGO ocean observations
                    and molecular biodiversity through
                    one conversational analytical workspace.
                  </p>

                </div>


                <div className="heading-actions">

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      initializeDemo
                    }
                  >

                    <FlaskConical
                      size={16}
                    />

                    Load Demo Dataset

                  </button>


                  <button
                    type="button"
                    className="icon-button"
                    onClick={() =>
                      void loadData()
                    }
                    aria-label="Refresh data"
                    title="Refresh data"
                  >

                    <RefreshCw
                      size={17}
                      className={
                        loading
                          ? "spin"
                          : ""
                      }
                    />

                  </button>

                </div>

              </div>


              <div className="metrics-grid">

                <MetricCard
                  title="ARGO Observations"
                  value={
                    observations.length
                  }
                  subtitle="Normalized ocean measurements"
                  icon={Waves}
                />


                <MetricCard
                  title="Unique Floats"
                  value={
                    uniqueFloats
                  }
                  subtitle="Tracked profiling platforms"
                  icon={Globe2}
                />


                <MetricCard
                  title="Species Richness"
                  value={
                    biodiversity
                      ?.species_richness ??
                    "—"
                  }
                  subtitle="Unique taxa identified"
                  icon={Fish}
                />


                <MetricCard
                  title="Shannon Diversity"
                  value={
                    biodiversity
                      ? biodiversity
                          .shannon_diversity
                          .toFixed(3)
                      : "—"
                  }
                  subtitle="Molecular biodiversity index"
                  icon={Activity}
                />

              </div>


              <div className="dashboard-grid">

                <section className="panel map-panel">

                  <div className="panel-header">

                    <div>

                      <div className="panel-eyebrow">
                        SPATIAL DATA
                      </div>

                      <h2>
                        ARGO Float Network
                      </h2>

                    </div>


                    <span className="panel-badge">

                      {
                        uniqueFloats
                      } floats

                    </span>

                  </div>


                  <FloatMap
                    observations={
                      observations
                    }
                    onSelectFloat={
                      selectFloat
                    }
                  />

                </section>


                <section className="panel chat-panel-wrapper">

                  <ChatPanel
                    onResponse={
                      handleChatResponse
                    }
                  />

                </section>

              </div>


              <div className="bottom-grid">

                <section className="panel">

                  <div className="panel-header">

                    <div>

                      <div className="panel-eyebrow">
                        PHYSICAL OCEANOGRAPHY
                      </div>

                      <h2>
                        Depth Profile
                      </h2>

                    </div>


                    {selectedFloat && (

                      <span className="panel-badge">

                        {
                          selectedFloat
                        }

                      </span>

                    )}

                  </div>


                  <div className="chart-height">

                    {selectedProfile.length >
                    0 ? (

                      <ProfileChart
                        observations={
                          selectedProfile
                        }
                        parameter={
                          profileParameter
                        }
                      />

                    ) : (

                      <div className="empty-state">

                        <Waves
                          size={28}
                        />

                        <p>
                          Select an ARGO float
                          on the map to inspect
                          its depth profile.
                        </p>

                      </div>

                    )}

                  </div>

                </section>


                <section className="panel">

                  <div className="panel-header">

                    <div>

                      <div className="panel-eyebrow">
                        OCEAN × BIOLOGY
                      </div>

                      <h2>
                        Salinity Relationship
                      </h2>

                    </div>

                  </div>


                  <div className="chart-height">

                    {correlation ? (

                      <CorrelationChart
                        result={
                          correlation
                        }
                      />

                    ) : (

                      <div className="empty-state">

                        <Activity
                          size={28}
                        />

                        <p>
                          Correlation data
                          unavailable.
                        </p>

                      </div>

                    )}

                  </div>

                </section>

              </div>


              <BiodiversityPrediction

                latitude={
                  selectedObservation?.latitude ??
                  undefined
                }

                longitude={
                  selectedObservation?.longitude ??
                  undefined
                }

                depth_m={
                  selectedObservation?.depth_m ??
                  undefined
                }

                temperature_c={
                  selectedObservation?.temperature_c ??
                  undefined
                }

                salinity_psu={
                  selectedObservation?.salinity_psu ??
                  undefined
                }

                oxygen_umol_kg={
                  selectedObservation?.oxygen_umol_kg ??
                  undefined
                }

                floatId={
                  selectedFloat
                }

              />

            </>

          )}


          {/* =========================================================
              EXPLORE
          ========================================================= */}

          {view ===
            "explore" && (

            <>

              <div className="page-heading compact">

                <div>

                  <div className="eyebrow">
                    DATA EXPLORER
                  </div>


                  <h1>
                    Ocean Observations
                  </h1>


                  <p>
                    Inspect normalized ARGO
                    measurements and depth-resolved
                    oceanographic parameters.
                  </p>

                </div>

              </div>


              <section className="panel">

                <div className="panel-header">

                  <div>

                    <div className="panel-eyebrow">
                      OBSERVATION STORE
                    </div>

                    <h2>
                      ARGO Measurements
                    </h2>

                  </div>


                  <span className="panel-badge">

                    {
                      observations.length
                    } records

                  </span>

                </div>


                <DataTable
                  observations={
                    observations
                  }
                />

              </section>


              <section className="panel explore-chat">

                <ChatPanel
                  onResponse={
                    handleChatResponse
                  }
                />

              </section>


              <BiodiversityPrediction

                latitude={
                  selectedObservation?.latitude ??
                  undefined
                }

                longitude={
                  selectedObservation?.longitude ??
                  undefined
                }

                depth_m={
                  selectedObservation?.depth_m ??
                  undefined
                }

                temperature_c={
                  selectedObservation?.temperature_c ??
                  undefined
                }

                salinity_psu={
                  selectedObservation?.salinity_psu ??
                  undefined
                }

                oxygen_umol_kg={
                  selectedObservation?.oxygen_umol_kg ??
                  undefined
                }

                floatId={
                  selectedFloat
                }

              />

            </>

          )}


          {/* =========================================================
              BIODIVERSITY
          ========================================================= */}

          {view ===
            "biodiversity" && (

            <>

              <div className="page-heading compact">

                <div>

                  <div className="eyebrow">
                    MOLECULAR BIODIVERSITY
                  </div>


                  <h1>
                    eDNA Intelligence
                  </h1>


                  <p>
                    Explore taxonomic observations,
                    molecular evidence, and community
                    diversity metrics.
                  </p>

                </div>

              </div>


              <BiodiversityPanel
                metrics={
                  biodiversity
                }
              />


              <div className="dashboard-grid">

                <section className="panel">

                  <div className="panel-header">

                    <div>

                      <div className="panel-eyebrow">
                        TAXONOMY
                      </div>

                      <h2>
                        Molecular Records
                      </h2>

                    </div>


                    <Database
                      size={19}
                    />

                  </div>


                  <div className="biodiversity-list">

                    <BiodiversityRow
                      name="Species richness"
                      rank={`${biodiversity?.species_richness ?? 0} taxa`}
                    />


                    <BiodiversityRow
                      name="Shannon diversity"
                      rank={
                        biodiversity
                          ? biodiversity
                              .shannon_diversity
                              .toFixed(3)
                          : "—"
                      }
                    />


                    <BiodiversityRow
                      name="Total abundance"
                      rank={`${biodiversity?.total_abundance ?? 0} observations`}
                    />

                  </div>

                </section>


                <section className="panel">

                  <div className="panel-header">

                    <div>

                      <div className="panel-eyebrow">
                        AI ANALYSIS
                      </div>

                      <h2>
                        Biodiversity Assistant
                      </h2>

                    </div>

                  </div>


                  <ChatPanel
                    onResponse={
                      handleChatResponse
                    }
                  />

                </section>

              </div>


              <BiodiversityPrediction

                latitude={
                  selectedObservation?.latitude ??
                  undefined
                }

                longitude={
                  selectedObservation?.longitude ??
                  undefined
                }

                depth_m={
                  selectedObservation?.depth_m ??
                  undefined
                }

                temperature_c={
                  selectedObservation?.temperature_c ??
                  undefined
                }

                salinity_psu={
                  selectedObservation?.salinity_psu ??
                  undefined
                }

                oxygen_umol_kg={
                  selectedObservation?.oxygen_umol_kg ??
                  undefined
                }

                floatId={
                  selectedFloat
                }

              />

            </>

          )}


          {/* =========================================================
              GLOBAL LOADING
          ========================================================= */}

          {loading && (

            <div className="global-loading">

              <RefreshCw
                size={16}
                className="spin"
              />

              Synchronizing data...

            </div>

          )}

        </main>

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Biodiversity row
|--------------------------------------------------------------------------
*/

function BiodiversityRow({
  name,
  rank,
}: {
  name: string;
  rank: string;
}) {

  return (
    <div className="taxon-row">

      <div className="taxon-icon">

        <Fish
          size={16}
        />

      </div>


      <div className="taxon-info">

        <strong>
          {name}
        </strong>

        <span>
          {rank}
        </span>

      </div>


      <div className="taxon-status">
        DATA
      </div>

    </div>
  );
}