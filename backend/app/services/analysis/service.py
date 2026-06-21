"""Orquestra a avaliação: cache, inferência, scoring e persistência.

Fluxo online (D9): consulta o cache por hash(texto + model_version); em caso de
falta, chama o ``AnalysisProvider``, deriva score/metrics/warnings, guarda no
cache e, quando há ``law_id``, persiste o resultado em ``Analysis`` (D11). Em
caso de falha do modelo NÃO retorna score simulado — levanta ``AnalysisError``
(D6/REQ-007), deixando o erro explícito para a camada de API.
"""

from __future__ import annotations

from typing import Any

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
    texto: str,
    law_id: str | None,
    *,
    provider: AnalysisProvider,
    cache: AnalysisCache,
    db: Any,
    strategy: str = DEFAULT_STRATEGY,
    threshold: float = DEFAULT_WARNING_THRESHOLD,
) -> dict[str, Any]:
    """Avalia o texto, usando cache e persistindo quando há ``law_id``."""
    key = cache.make_key(texto, provider.model_version)

    cached_result = cache.get(key)
    if cached_result is not None:
        return {**cached_result, "cached": True}

    try:
        probabilities = provider.analyze(texto)
    except Exception as exc:  # noqa: BLE001 - reembala como erro explícito
        raise AnalysisError(f"Falha na análise do texto: {exc}") from exc

    scored = score_analysis(probabilities, strategy=strategy, threshold=threshold)
    result = {
        "score": scored["score"],
        "metrics": scored["metrics"],
        "warnings": scored["warnings"],
        "model_version": provider.model_version,
        "cached": False,
    }

    cache.set(key, result)

    if law_id is not None:
        # Relação obrigatória via connect; campos Json exigem o wrapper Json.
        await db.analysis.create(
            data={
                "law": {"connect": {"id": law_id}},
                "score": result["score"],
                "metrics": Json(result["metrics"]),
                "warnings": Json(result["warnings"]),
                "modelVersion": result["model_version"],
                "cached": False,
            }
        )

    return result
