from functools import lru_cache

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    """
    Central application configuration.

    Environment variables can override
    these defaults.
    """

    database_url: str = (
        "sqlite:///./oceanfusion.db"
    )


    # --------------------------------------------------------------
    # CORS
    # --------------------------------------------------------------

    cors_origins: str = (
        "http://localhost:5173,"
        "http://localhost:5174,"
        "http://127.0.0.1:5173,"
        "http://127.0.0.1:5174"
    )


    # --------------------------------------------------------------
    # LLM
    # --------------------------------------------------------------

    llm_provider: str = "rules"

    llm_api_key: str | None = None

    llm_model: str | None = None


    # --------------------------------------------------------------
    # Data directories
    # --------------------------------------------------------------

    argo_data_dir: str = (
        "./data/argo"
    )

    edna_data_dir: str = (
        "./data/edna"
    )


    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


    @property
    def cors_origin_list(
        self,
    ) -> list[str]:

        return [
            origin.strip()
            for origin
            in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:

    return Settings()