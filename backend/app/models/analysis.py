from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class LawType(str, Enum):
    """Tipo do texto legislativo submetido para análise."""

    BILL = "bill"
    AMENDMENT = "amendment"


class AnalysisStatus(str, Enum):
    """Estado da análise; `pending` reservado para o modo assíncrono futuro."""

    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisRequest(BaseModel):
    """Entrada de `POST /api/v1/analysis/evaluate` (contrato da arquitetura)."""

    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_schema_extra={
            "example": {
                "text": (
                    "Art. 1 O órgão competente poderá, quando julgar "
                    "necessário, adotar as medidas cabíveis."
                ),
                "type": "bill",
            }
        },
    )

    text: str = Field(..., min_length=1)
    type: LawType
    # Opcional: vincula a análise a uma lei existente (catálogo ou submissão),
    # habilitando persistência e o histórico em /api/v1/laws/{id}/...
    lawId: str | None = None


class AnalysisWarning(BaseModel):
    """Apontamento de uma categoria de problema acima do limiar."""

    code: str
    message: str
    confidence: float = Field(..., ge=0, le=1)


class AnalysisResponse(BaseModel):
    """Saída de `evaluate` e de `GET /api/v1/laws/{id}/analysis`."""

    analysis_id: str
    status: AnalysisStatus
    score: float | None = Field(default=None, ge=0, le=1)
    summary: str | None = None
    metrics: dict[str, float] = Field(default_factory=dict)
    warnings: list[AnalysisWarning] = Field(default_factory=list)
    model_version: str
    cached: bool = False


class AnalysisHistoryItem(BaseModel):
    """Item do histórico em `GET /api/v1/laws/{id}/history`."""

    timestamp: datetime
    score: float = Field(..., ge=0, le=1)
    model_version: str
