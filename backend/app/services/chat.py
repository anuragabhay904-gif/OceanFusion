from sqlalchemy.orm import Session

from app.domain.schemas import (
    ChatResponse,
    ChartSpec,
)

from app.repositories.observations import (
    list_biodiversity,
    list_float_observations,
)

from app.services.analytics import (
    biodiversity_metrics,
    correlation,
)

from app.services.query_planner import (
    QueryPlanner,
)


class ChatService:

    def __init__(self):

        self.planner = QueryPlanner()


    def answer(
        self,
        db: Session,
        message: str,
        session_id: str,
    ) -> ChatResponse:

        plan = self.planner.plan(
            message
        )


        # ============================================================
        # CORRELATION
        # ============================================================

        if (
            plan.intent
            == "correlation"
        ):

            result = correlation(
                db,
                ocean_parameter=(
                    plan.metric
                    or "salinity_psu"
                ),
            )


            coefficient = (
                result["coefficient"]
            )


            return ChatResponse(

                answer=(
                    f"Matched "
                    f"{result['sample_count']} "
                    f"biodiversity samples. "

                    f"The {result['method']} "
                    f"correlation between "
                    f"{result['x_parameter']} "
                    f"and Shannon diversity "
                    f"is {coefficient}. "

                    f"{result['interpretation']}"
                ),

                plan=plan,

                provenance=[
                    "float_observations",
                    "biodiversity_records",
                    "spatial_temporal_join",
                ],
            )


        # ============================================================
        # BIODIVERSITY
        # ============================================================

        if (
            plan.intent
            == "biodiversity_lookup"
        ):

            rows = list_biodiversity(
                db,
                limit=100,
            )


            metrics = biodiversity_metrics(
                db
            )


            return ChatResponse(

                answer=(
                    f"Returned {len(rows)} "
                    f"biodiversity records. "

                    f"The loaded dataset contains "
                    f"{metrics['species_richness']} "
                    f"unique taxa with a Shannon "
                    f"diversity of "
                    f"{metrics['shannon_diversity']}."
                ),

                plan=plan,

                provenance=[
                    "biodiversity_records"
                ],
            )


        # ============================================================
        # DEPTH PROFILE
        # ============================================================

        if (
            plan.intent
            == "depth_profile"
        ):

            rows = sorted(
                list_float_observations(
                    db,
                    limit=100,
                ),
                key=lambda row:
                    row.depth_m,
            )


            # --------------------------------------------------------
            # Determine requested parameter
            # --------------------------------------------------------

            metric = (
                plan.metric
                or "temperature_c"
            )


            # --------------------------------------------------------
            # Display metadata
            # --------------------------------------------------------

            metric_config = {

                "temperature_c": {
                    "title":
                        "Ocean Temperature by Depth",

                    "label":
                        "Temperature (°C)",
                },

                "salinity_psu": {
                    "title":
                        "Ocean Salinity by Depth",

                    "label":
                        "Salinity (PSU)",
                },

                "oxygen_umol_kg": {
                    "title":
                        "Ocean Oxygen by Depth",

                    "label":
                        "Oxygen (µmol/kg)",
                },
            }


            config = metric_config.get(
                metric,
                metric_config[
                    "temperature_c"
                ],
            )


            # --------------------------------------------------------
            # Extract Y values
            # --------------------------------------------------------

            if metric == "salinity_psu":

                values = [
                    row.salinity_psu
                    for row in rows
                ]


            elif metric == "oxygen_umol_kg":

                values = [
                    row.oxygen_umol_kg
                    for row in rows
                ]


            else:

                values = [
                    row.temperature_c
                    for row in rows
                ]


            return ChatResponse(

                answer=(
                    f"Found {len(rows)} "
                    f"ocean observations "
                    f"for the requested "
                    f"{config['label']} "
                    f"depth profile."
                ),

                plan=plan,

                chart=ChartSpec(

                    type="line",

                    title=config[
                        "title"
                    ],

                    x=[
                        row.depth_m
                        for row in rows
                    ],

                    y=values,

                    x_label="Depth (m)",

                    y_label=config[
                        "label"
                    ],
                ),

                provenance=[
                    "float_observations"
                ],
            )


        # ============================================================
        # ARGO LOOKUP
        # ============================================================

        if (
            plan.intent
            == "argo_lookup"
        ):

            rows = (
                list_float_observations(
                    db,
                    limit=100,
                )
            )


            return ChatResponse(

                answer=(
                    f"Found {len(rows)} "
                    "ARGO ocean observations "
                    "in the loaded dataset."
                ),

                plan=plan,

                provenance=[
                    "float_observations"
                ],
            )


        # ============================================================
        # OVERVIEW
        # ============================================================

        ocean_rows = (
            list_float_observations(
                db,
                limit=100,
            )
        )


        biodiversity_rows = (
            list_biodiversity(
                db,
                limit=100,
            )
        )


        return ChatResponse(

            answer=(
                "OceanFusion currently has "
                f"{len(ocean_rows)} ocean "
                "observations and "
                f"{len(biodiversity_rows)} "
                "biodiversity records."
            ),

            plan=plan,

            provenance=[
                "float_observations",
                "biodiversity_records",
            ],
        )