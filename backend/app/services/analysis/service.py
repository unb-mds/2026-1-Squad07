"""Orquestra a avaliação: cache, inferência, scoring e persistência.

Fluxo online (D9): consulta o cache por hash(texto + model_version), que evita
**reprocessar a inferência**. A persistência é independente do cache: sempre que
há ``law_id``, cada execução grava uma linha em ``Analysis`` (D11), inclusive em
cache hit — caso contrário o histórico da lei ficaria vazio. Em caso de falha do
modelo NÃO retorna score simulado: levanta ``AnalysisError`` (D6/REQ-007),
deixando o erro explícito para a camada de API traduzir em 503.
"""

from __future__ import annotations

from typing import Any
from uuid import uuid4

from prisma import Json

from app.services.analysis.cache import AnalysisCache
from app.services.analysis.scoring import (
    DEFAULT_STRATEGY,
    DEFAULT_WARNING_THRESHOLD,
    score_analysis,
)
from app.services.analysis_provider import AnalysisProvider


class AnalysisError(Exception):
    """Falha ao executar a análise; nunca acompanha resultado simulado."""


async def evaluate_text(
    text: str,
    law_id: str | None,
    *,
    provider: AnalysisProvider,
    cache: AnalysisCache,
    db: Any,
    strategy: str = DEFAULT_STRATEGY,
    threshold: float = DEFAULT_WARNING_THRESHOLD,
) -> dict[str, Any]:
    """Avalia o texto (cache evita só a inferência) e persiste se houver lei."""
    key = cache.make_key(text, provider.model_version)

    scored = cache.get(key)
    cached = scored is not None
    if not cached:
        try:
            probabilities = provider.analyze(text)
        except Exception as exc:  # noqa: BLE001 - reembala como erro explícito
            raise AnalysisError(f"Falha na análise do texto: {exc}") from exc
        scored = score_analysis(probabilities, strategy=strategy, threshold=threshold)
        cache.set(key, scored)

    analysis_id = str(uuid4())
    if law_id is not None:
        # Relação obrigatória via connect; campos Json exigem o wrapper Json.
        # Persiste mesmo em cache hit: cada execução é uma entrada no histórico.
        created = await db.analysis.create(
            data={
                "law": {"connect": {"id": law_id}},
                "score": scored["score"],
                "metrics": Json(scored["metrics"]),
                "warnings": Json(scored["warnings"]),
                "modelVersion": provider.model_version,
                "cached": cached,
            }
        )
        analysis_id = created.id

    return {
        "analysis_id": analysis_id,
        "status": "completed",
        "score": scored["score"],
        "metrics": scored["metrics"],
        "warnings": scored["warnings"],
        "model_version": provider.model_version,
        "cached": cached,
    }
