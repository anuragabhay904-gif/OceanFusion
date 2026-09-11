from app.services.query_planner import (
    QueryPlanner,
)


def test_correlation():

    planner = QueryPlanner()

    result = planner.plan(
        "How does salinity correlate "
        "with biodiversity?"
    )

    assert result.intent == "correlation"

    assert (
        result.metric
        == "salinity_psu"
    )


def test_depth_profile():

    planner = QueryPlanner()

    result = planner.plan(
        "Show ARGO depth profile"
    )

    assert (
        result.intent
        == "depth_profile"
    )