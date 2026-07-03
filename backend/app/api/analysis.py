"""Endpoints de análise legislativa (fluxo online da R2).

Contratos conforme `docs/architecture/ai-integration.md`:
- ``POST /api/v1/analysis/evaluate``: classifica um texto sob demanda.
- ``GET  /api/v1/laws/{id}/analysis``: análise mais recente de uma lei.
- ``GET  /api/v1/laws/{id}/history``: histórico de análises de uma lei.

O frontend nunca chama a IA diretamente: toda inferência passa por aqui (D1).
"""

import os
from fastapi import APIRouter, HTTPException, status

from app.db.client import db
from app.models.analysis import (
    AnalysisHistoryItem,
    AnalysisRequest,
    AnalysisResponse,
)
from app.services.analysis.cache import AnalysisCache
from app.services.analysis.service import AnalysisError, evaluate_text
from app.services.analysis_provider import LegalBERTProvider, TfidfProvider
from app.services.summary_provider import (
    GeminiSummaryProvider,
    MockSummaryProvider,
)

router = APIRouter(prefix="/api/v1", tags=["analysis"])

# Classificador padrão: TF-IDF leve (sem torch, ~175 MB de RAM, cabe no Render).
# Defina CLASSIFIER=legalbert para usar o LegalBERT (requer torch + pesos).
if os.getenv("CLASSIFIER", "tfidf").lower() == "legalbert":
    provider = LegalBERTProvider()
else:
    provider = TfidfProvider()
cache = AnalysisCache()

environment = os.getenv("ENVIRONMENT", "development")
gemini_key = os.getenv("GEMINI_API_KEY")

if gemini_key:
    summary_provider = GeminiSummaryProvider(gemini_key)
elif environment == "production":
    # Em produção, sem chave, desabilita geração de resumos sem usar mock
    summary_provider = GeminiSummaryProvider(None)
else:
    # Em desenvolvimento ou testes locais, mantém o Mock
    summary_provider = MockSummaryProvider()


def _to_response(analysis) -> dict:
    """Mapeia uma linha de Analysis para o schema de resposta."""
    return {
        "analysis_id": analysis.id,
        "status": "completed",
        "score": analysis.score,
        "summary": analysis.summary,
        "metrics": analysis.metrics,
        "warnings": analysis.warnings,
        "model_version": analysis.modelVersion,
        "cached": analysis.cached,
    }


@router.post("/analysis/evaluate", response_model=AnalysisResponse)
async def evaluate(payload: AnalysisRequest):
    """Classifica o texto e retorna score e métricas."""
    if payload.lawId is not None:
        law = await db.law.find_unique(where={"id": payload.lawId})
        if law is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lei não encontrada.",
            )

    try:
        return await evaluate_text(
            payload.text,
            payload.lawId,
            provider=provider,
            summary_provider=summary_provider,
            cache=cache,
            db=db,
        )
    except AnalysisError as exc:
        # Falha do serviço de IA, sem score simulado (D6/REQ-007).
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )


@router.get("/laws/{id}/analysis", response_model=AnalysisResponse)
async def latest_analysis(id: str):
    """Retorna a análise mais recente da lei identificada por ``law.id``."""
    law = await db.law.find_unique(where={"id": id})
    if law is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lei não encontrada.",
        )

    analysis = await db.analysis.find_first(
        where={"lawId": id},
        order={"createdAt": "desc"},
    )
    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lei sem análise.",
        )

    return _to_response(analysis)


@router.get("/laws/{id}/history", response_model=list[AnalysisHistoryItem])
async def history(id: str):
    """Retorna o histórico de análises da lei."""
    law = await db.law.find_unique(where={"id": id})
    if law is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lei não encontrada.",
        )

    analyses = await db.analysis.find_many(
        where={"lawId": id},
        order={"createdAt": "desc"},
    )
    return [
        {
            "timestamp": analysis.createdAt,
            "score": analysis.score,
            "model_version": analysis.modelVersion,
        }
        for analysis in analyses
    ]
