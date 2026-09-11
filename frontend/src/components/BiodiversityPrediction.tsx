import {
  Brain,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  predictBiodiversity,
} from "../api";

import type {
  BiodiversityPrediction as PredictionResult,
} from "../api";


interface BiodiversityPredictionProps {
  latitude?: number;
  longitude?: number;
  depth_m?: number;
  temperature_c?: number;
  salinity_psu?: number;
  oxygen_umol_kg?: number;

  floatId?: string | null;
}


export default function BiodiversityPrediction({
  latitude = 20,
  longitude = 70,
  depth_m = 20,
  temperature_c = 25,
  salinity_psu = 35,
  oxygen_umol_kg = 210,
  floatId = null,
}: BiodiversityPredictionProps) {

  const [
    prediction,
    setPrediction,
  ] = useState<
    PredictionResult | null
  >(null);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  async function handlePredict(): Promise<void> {

    setLoading(true);

    setError(null);

    try {

      const result =
        await predictBiodiversity({
          latitude,
          longitude,
          depth_m,
          temperature_c,
          salinity_psu,
          oxygen_umol_kg,
        });


      setPrediction(
        result
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Prediction failed."
      );

    } finally {

      setLoading(false);

    }
  }


  const isSelectedFloat =
    Boolean(floatId);


  return (
    <section className="panel biodiversity-prediction">

      <div className="panel-header">

        <div>

          <div className="panel-eyebrow">
            MACHINE LEARNING
          </div>

          <h2>
            Biodiversity Prediction
          </h2>

          <p className="prediction-subtitle">

            {isSelectedFloat
              ? `Using ARGO float ${floatId}`
              : "Using example ocean conditions"}

          </p>

        </div>


        <div className="prediction-icon">

          <Brain
            size={18}
          />

        </div>

      </div>


      <div className="prediction-input-grid">

        <div>

          <span>
            Latitude
          </span>

          <strong>
            {latitude.toFixed(2)}°
          </strong>

        </div>


        <div>

          <span>
            Longitude
          </span>

          <strong>
            {longitude.toFixed(2)}°
          </strong>

        </div>


        <div>

          <span>
            Depth
          </span>

          <strong>
            {depth_m.toFixed(1)} m
          </strong>

        </div>


        <div>

          <span>
            Temperature
          </span>

          <strong>
            {temperature_c.toFixed(2)} °C
          </strong>

        </div>


        <div>

          <span>
            Salinity
          </span>

          <strong>
            {salinity_psu.toFixed(2)} PSU
          </strong>

        </div>


        <div>

          <span>
            Oxygen
          </span>

          <strong>
            {oxygen_umol_kg.toFixed(2)} µmol/kg
          </strong>

        </div>

      </div>


      <button
        type="button"
        className="prediction-button"
        onClick={() =>
          void handlePredict()
        }
        disabled={
          loading
        }
      >

        {loading ? (

          <>

            <Loader2
              size={16}
              className="spin"
            />

            Predicting...

          </>

        ) : (

          <>

            <Sparkles
              size={16}
            />

            Predict Biodiversity

          </>

        )}

      </button>


      {error && (

        <div
          className="prediction-error"
          role="alert"
        >

          {error}

        </div>

      )}


      {prediction && (

        <div className="prediction-result">

          <div className="prediction-result-label">
            PREDICTED SHANNON DIVERSITY
          </div>


          <div className="prediction-value">

            {prediction
              .predicted_shannon_diversity
              .toFixed(3)}

          </div>


          <div className="prediction-model">

            <span>
              Model
            </span>

            <strong>
              {prediction.model}
            </strong>

          </div>


          <div className="prediction-model">

            <span>
              Target
            </span>

            <strong>
              Shannon diversity
            </strong>

          </div>

        </div>

      )}

    </section>
  );
}