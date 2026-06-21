from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AnalysisCreateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    lawId: str = Field(..., min_length=1)
    score: float = Field(..., ge=0, le=1)
    metrics: dict[str, Any]
    warnings: list[dict[str, Any]]
    modelVersion: str = Field(..., min_length=1)
    cached: bool = False


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    lawId: str
    score: float
    metrics: dict[str, Any]
    warnings: list[dict[str, Any]]
    modelVersion: str
    cached: bool
    createdAt: datetime


class EvaluateRequest(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_schema_extra={
            "example": {
                "texto": (
                    "Art. 1 O órgão competente poderá, quando julgar "
                    "necessário, adotar as medidas cabíveis."
                )
            }
        },
    )

    texto: str = Field(..., min_length=1)
    # Opcional: quando informado, o resultado é persistido em Analysis e
    # aparece no histórico da lei (GET /api/v1/analysis/{lawId}/history).
    lawId: str | None = None


class EvaluateResponse(BaseModel):
    score: float
    metrics: dict[str, float]
    warnings: list[dict[str, Any]]
    model_version: str
    cached: bool
