"""Endpoints de análise legislativa (fluxo online da R2).

- ``POST /api/v1/analysis/evaluate``: classifica um texto sob demanda.
- ``GET  /api/v1/analysis/{id}/history``: histórico de análises de uma lei.

O frontend nunca chama a IA diretamente: toda inferência passa por aqui (D1).
"""

from fastapi import APIRouter, HTTPException, status

from app.db.client import db
from app.models.analysis import (
    AnalysisResponse,
    EvaluateRequest,
    EvaluateResponse,
)
from app.services.analysis.cache import AnalysisCache
from app.services.analysis.service import AnalysisError, evaluate_text
from app.services.analysis_provider import LegalBERTProvider

router = APIRouter(prefix="/api/v1/analysis", tags=["analysis"])

# Instâncias de processo: o modelo é auto-hospedado e carregado preguiçosamente
# na primeira inferência; o cache vive por processo (D2/D4).
provider = LegalBERTProvider()
cache = AnalysisCache()


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate(payload: EvaluateRequest):
    """Classifica o texto e retorna score, métricas, avisos e versão do modelo."""
    try:
        return await evaluate_text(
            payload.texto,
            payload.lawId,
            provider=provider,
            cache=cache,
            db=db,
        )
    except AnalysisError as exc:
        # Falha explícita, sem score simulado (D6/REQ-007).
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        )


@router.get("/{id}/history", response_model=list[AnalysisResponse])
async def history(id: str):
    """Retorna as análises persistidas de uma lei, da mais recente para a antiga."""
    return await db.analysis.find_many(
        where={"lawId": id},
        order={"createdAt": "desc"},
    )
