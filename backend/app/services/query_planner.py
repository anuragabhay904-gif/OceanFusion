import re

from app.domain.schemas import QueryPlan


class QueryPlanner:
    """
    Converts natural-language questions into
    validated domain-level query plans.

    This intentionally separates language understanding
    from data execution.
    """

    def plan(
        self,
        message: str,
    ) -> QueryPlan:

        text = (
            message
            .strip()
            .lower()
        )


        # ============================================================
        # ENTITY DETECTION
        # ============================================================

        entities: list[str] = []


        if (
            "argo" in text
            or "float" in text
            or "ocean" in text
        ):
            entities.append(
                "argo"
            )


        if any(
            word in text
            for word in [
                "edna",
                "species",
                "biodiversity",
                "taxonomy",
                "diversity",
                "taxa",
            ]
        ):
            entities.append(
                "biodiversity"
            )


        # ============================================================
        # METRIC DETECTION
        # ============================================================

        metric: str | None = None


        if any(
            phrase in text
            for phrase in [
                "salinity",
                "salt",
                "psu",
            ]
        ):

            metric = (
                "salinity_psu"
            )


        elif any(
            phrase in text
            for phrase in [
                "temperature",
                "temp",
                "thermal",
                "heat",
            ]
        ):

            metric = (
                "temperature_c"
            )


        elif any(
            phrase in text
            for phrase in [
                "oxygen",
                "o2",
            ]
        ):

            metric = (
                "oxygen_umol_kg"
            )


        # ============================================================
        # CORRELATION INTENT
        # ============================================================

        correlation_terms = [
            "correlate",
            "correlation",
            "relationship",
            "compare",
            "associated with",
            "association",
            "related to",
            "relation between",
        ]


        is_correlation_query = any(
            term in text
            for term in correlation_terms
        )


        # ============================================================
        # DEPTH / PROFILE INTENT
        # ============================================================

        profile_terms = [
            "depth",
            "profile",
            "by depth",
            "with depth",
            "depth-wise",
            "depthwise",
            "vertical profile",
            "vertical",
            "plot",
            "graph",
            "chart",
            "trend",
        ]


        has_profile_term = any(
            term in text
            for term in profile_terms
        )


        # ============================================================
        # SHORT NATURAL-LANGUAGE PROFILE QUERIES
        # ============================================================

        # Examples:
        #   show me the temp
        #   show temperature
        #   show me salinity
        #   show oxygen
        #   give me the temp
        #   display temperature
        #   plot the temperature
        #

        short_profile_patterns = [
            r"\bshow\s+(?:me\s+)?(?:the\s+)?(?:temp|temperature|salinity|oxygen)\b",
            r"\bdisplay\s+(?:the\s+)?(?:temp|temperature|salinity|oxygen)\b",
            r"\bgive\s+me\s+(?:the\s+)?(?:temp|temperature|salinity|oxygen)\b",
            r"\bplot\s+(?:the\s+)?(?:temp|temperature|salinity|oxygen)\b",
            r"\bgraph\s+(?:the\s+)?(?:temp|temperature|salinity|oxygen)\b",
            r"\bchart\s+(?:the\s+)?(?:temp|temperature|salinity|oxygen)\b",
            r"\b(?:temp|temperature|salinity|oxygen)\s+profile\b",
            r"\b(?:temp|temperature|salinity|oxygen)\s+by\s+depth\b",
            r"\b(?:temp|temperature|salinity|oxygen)\s+with\s+depth\b",
        ]


        is_short_profile_query = any(
            re.search(
                pattern,
                text,
            )
            for pattern in short_profile_patterns
        )


        # ============================================================
        # BIODIVERSITY INTENT
        # ============================================================

        biodiversity_terms = [
            "species",
            "taxonomy",
            "taxa",
            "edna",
            "biodiversity",
            "diversity",
            "organisms",
            "communities",
        ]


        is_biodiversity_query = any(
            term in text
            for term in biodiversity_terms
        )


        # ============================================================
        # INTENT PRIORITY
        # ============================================================

        if is_correlation_query:

            intent = (
                "correlation"
            )


        elif (
            has_profile_term
            or is_short_profile_query
        ) and metric is not None:

            intent = (
                "depth_profile"
            )


        elif is_biodiversity_query:

            intent = (
                "biodiversity_lookup"
            )


        elif (
            "argo" in text
            or "float" in text
            or "ocean" in text
        ):

            intent = (
                "argo_lookup"
            )


        else:

            intent = (
                "overview"
            )


        # ============================================================
        # FILTER EXTRACTION
        # ============================================================

        filters: dict[str, float] = {}


        # Salinity > X
        match = re.search(
            r"salinity\s*"
            r"(?:>|above|greater than)\s*"
            r"(\d+(?:\.\d+)?)",
            text,
        )


        if match:

            filters[
                "salinity_gt"
            ] = float(
                match.group(1)
            )


        # Temperature > X
        match = re.search(
            r"(?:temperature|temp)\s*"
            r"(?:>|above|greater than)\s*"
            r"(\d+(?:\.\d+)?)",
            text,
        )


        if match:

            filters[
                "temperature_gt"
            ] = float(
                match.group(1)
            )


        # Depth < X
        match = re.search(
            r"depth\s*"
            r"(?:<|below|under|less than)\s*"
            r"(\d+(?:\.\d+)?)",
            text,
        )


        if match:

            filters[
                "depth_lt"
            ] = float(
                match.group(1)
            )


        # Depth > X
        match = re.search(
            r"depth\s*"
            r"(?:>|above|greater than)\s*"
            r"(\d+(?:\.\d+)?)",
            text,
        )


        if match:

            filters[
                "depth_gt"
            ] = float(
                match.group(1)
            )


        # ============================================================
        # RETURN PLAN
        # ============================================================

        return QueryPlan(
            intent=intent,
            entities=entities,
            filters=filters,
            metric=metric,
        )