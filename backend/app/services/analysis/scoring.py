"""Deriva ``score``, ``metrics`` e ``warnings`` das probabilidades do modelo.

Conforme R-005/REQ-011: o ``score`` geral é ``1 - média(probabilidades por
categoria)``; ``metrics`` carrega a probabilidade por categoria; e ``warnings``
lista as categorias acima de um limiar, cada uma com sua ``confidence``. A
estratégia de scoring é configurável para evoluir sem mudar os chamadores.
"""

from __future__ import annotations

from typing import Any, Callable

from app.services.analysis_provider import CATEGORY_MESSAGES

# Limiar padrão a partir do qual uma categoria vira um aviso de qualidade.
DEFAULT_WARNING_THRESHOLD = 0.5


def _mean_complement(probabilities: dict[str, float]) -> float:
    """Score = 1 - média das probabilidades de problema por categoria."""
    values = list(probabilities.values())
    return 1.0 - (sum(values) / len(values))


# Estratégias de scoring registradas; permite trocar a fórmula por configuração.
SCORING_STRATEGIES: dict[str, Callable[[dict[str, float]], float]] = {
    "mean_complement": _mean_complement,
}

DEFAULT_STRATEGY = "mean_complement"


def compute_score(
    probabilities: dict[str, float],
    strategy: str = DEFAULT_STRATEGY,
) -> float:
    """Calcula o score geral a partir das probabilidades por categoria."""
    if not probabilities:
        raise ValueError("Probabilidades vazias: não há como calcular o score.")
    try:
        scorer = SCORING_STRATEGIES[strategy]
    except KeyError as exc:
        raise ValueError(f"Estratégia de scoring desconhecida: {strategy}") from exc
    return scorer(probabilities)


def build_metrics(probabilities: dict[str, float]) -> dict[str, float]:
    """Métricas = probabilidade por categoria (cópia defensiva)."""
    return dict(probabilities)


def build_warnings(
    probabilities: dict[str, float],
    threshold: float = DEFAULT_WARNING_THRESHOLD,
) -> list[dict[str, Any]]:
    """Avisos = categorias acima do limiar (code/message/confidence), desc."""
    warnings = [
        {
            "code": category,
            "message": CATEGORY_MESSAGES.get(category, category),
            "confidence": confidence,
        }
        for category, confidence in probabilities.items()
        if confidence >= threshold
    ]
    warnings.sort(key=lambda item: item["confidence"], reverse=True)
    return warnings


def score_analysis(
    probabilities: dict[str, float],
    *,
    strategy: str = DEFAULT_STRATEGY,
    threshold: float = DEFAULT_WARNING_THRESHOLD,
) -> dict[str, Any]:
    """Agrega score, métricas e avisos em um único resultado."""
    return {
        "score": compute_score(probabilities, strategy),
        "metrics": build_metrics(probabilities),
        "warnings": build_warnings(probabilities, threshold),
    }
