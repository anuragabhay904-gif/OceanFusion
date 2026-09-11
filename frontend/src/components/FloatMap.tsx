import { useEffect } from "react";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type {
  LatLngExpression,
} from "leaflet";

import type {
  FloatObservation,
} from "../types";


interface FloatMapProps {
  observations: FloatObservation[];

  onSelectFloat: (
    floatId: string
  ) => void;
}


/*
|--------------------------------------------------------------------------
| Automatically fit map to observations
|--------------------------------------------------------------------------
*/

function MapAutoFit({
  observations,
}: {
  observations: FloatObservation[];
}) {

  const map = useMap();


  useEffect(() => {

    const valid =
      observations.filter(
        (row) =>
          Number.isFinite(
            row.latitude
          ) &&
          Number.isFinite(
            row.longitude
          ) &&
          Math.abs(
            row.latitude
          ) <= 90 &&
          Math.abs(
            row.longitude
          ) <= 180
      );


    if (
      valid.length === 0
    ) {
      return;
    }


    const bounds =
      valid.map(
        (row) =>
          [
            row.latitude,
            row.longitude,
          ] as [
            number,
            number
          ]
      );


    map.fitBounds(
      bounds,
      {
        padding: [
          28,
          28,
        ],

        maxZoom: 4,
      }
    );

  }, [
    map,
    observations,
  ]);


  return null;
}


/*
|--------------------------------------------------------------------------
| Float map
|--------------------------------------------------------------------------
*/

export default function FloatMap({
  observations,
  onSelectFloat,
}: FloatMapProps) {

  /*
  |--------------------------------------------------------------------------
  | Keep only valid geographic observations
  |--------------------------------------------------------------------------
  */

  const points =
    observations.filter(
      (row) =>
        Number.isFinite(
          row.latitude
        ) &&
        Number.isFinite(
          row.longitude
        ) &&
        Math.abs(
          row.latitude
        ) <= 90 &&
        Math.abs(
          row.longitude
        ) <= 180
    );


  /*
  |--------------------------------------------------------------------------
  | Map center
  |--------------------------------------------------------------------------
  */

  const center:
    LatLngExpression =
    points.length > 0
      ? [
          points[0].latitude,
          points[0].longitude,
        ]
      : [
          10,
          0,
        ];


  /*
  |--------------------------------------------------------------------------
  | Group observations by float
  |--------------------------------------------------------------------------
  */

  const grouped =
    new Map<
      string,
      FloatObservation
    >();


  for (
    const row of points
  ) {

    if (
      !grouped.has(
        row.float_id
      )
    ) {

      grouped.set(
        row.float_id,
        row
      );

    }
  }


  return (
    <div className="float-map">

      <MapContainer
        center={center}
        zoom={2}
        scrollWheelZoom
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        <MapAutoFit
          observations={points}
        />


        {Array.from(
          grouped.values()
        ).map(
          (row) => (

            <CircleMarker
              key={
                row.float_id
              }

              center={[
                row.latitude,
                row.longitude,
              ]}

              radius={7}

              pathOptions={{
                className:
                  "float-marker",

                fillOpacity:
                  0.85,

                weight:
                  2,
              }}

              eventHandlers={{
                click: () => {

                  onSelectFloat(
                    row.float_id
                  );

                },
              }}
            >

              <Popup>

                <div
                  className="map-popup"
                >

                  <strong>
                    {
                      row.float_id
                    }
                  </strong>


                  <span>

                    {
                      row.latitude.toFixed(
                        3
                      )
                    }°

                    {", "}

                    {
                      row.longitude.toFixed(
                        3
                      )
                    }°

                  </span>


                  <span>
                    {
                      row.timestamp ||
                      "Timestamp unavailable"
                    }
                  </span>


                  <button
                    type="button"

                    onClick={(
                      event
                    ) => {

                      /*
                      |--------------------------------------------------------------------------
                      | Prevent the click from bubbling to the map
                      |--------------------------------------------------------------------------
                      */

                      event.preventDefault();

                      event.stopPropagation();


                      /*
                      |--------------------------------------------------------------------------
                      | Load this float's profile
                      |--------------------------------------------------------------------------
                      */

                      onSelectFloat(
                        row.float_id
                      );

                    }}
                  >

                    Inspect profile

                  </button>

                </div>

              </Popup>

            </CircleMarker>

          )
        )}

      </MapContainer>


      {points.length === 0 && (

        <div className="map-empty">

          <MapPinFallback />

          <strong>
            No geographic observations
          </strong>

          <span>
            Load the demo dataset or check
            the ARGO API.
          </span>

        </div>

      )}

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Empty map fallback
|--------------------------------------------------------------------------
*/

function MapPinFallback() {

  return (
    <span
      className="map-empty-dot"
    />
  );
}