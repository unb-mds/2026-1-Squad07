"""Testes do scoring: score, métricas e avisos (REQ-011)."""

import pytest

from app.services.analysis.scoring import (
    build_metrics,
    build_warnings,
    compute_score,
    score_analysis,
)


def test_score_e_complemento_da_media_das_probabilidades():
    """SC-1: score = 1 - média das probabilidades por categoria."""
    probabilities = {
        "ambiguidade": 0.2,
        "vagueza": 0.4,
        "falta_referencia": 0.6,
        "inconsistencia": 0.8,
    }

    # média = 0.5 -> score = 0.5
    assert compute_score(probabilities) == pytest.approx(0.5)


def test_metrics_contem_probabilidade_por_categoria():
    """SC-2: metrics traz uma entrada por categoria."""
    probabilities = {"ambiguidade": 0.1, "vagueza": 0.9}

    metrics = build_metrics(probabilities)

    assert metrics == {"ambiguidade": 0.1, "vagueza": 0.9}
    # cópia defensiva: alterar a saída não afeta a entrada
    metrics["ambiguidade"] = 0.0
    assert probabilities["ambiguidade"] == 0.1


def test_warnings_lista_categorias_acima_do_limiar_com_confidence():
    """SC-3: avisos só para categorias acima do limiar, ordenados desc."""
    probabilities = {
        "ambiguidade": 0.9,
        "vagueza": 0.2,
        "falta_referencia": 0.7,
        "inconsistencia": 0.5,
    }

    warnings = build_warnings(probabilities, threshold=0.5)

    assert warnings == [
        {"category": "ambiguidade", "confidence": 0.9},
        {"category": "falta_referencia", "confidence": 0.7},
        {"category": "inconsistencia", "confidence": 0.5},
    ]


def test_warnings_vazio_quando_nada_acima_do_limiar():
    """SC-4: nenhuma categoria acima do limiar -> sem avisos."""
    probabilities = {"ambiguidade": 0.1, "vagueza": 0.2}

    assert build_warnings(probabilities, threshold=0.5) == []


def test_score_analysis_agrega_score_metrics_warnings():
    """score_analysis devolve as três derivações de uma vez."""
    probabilities = {"ambiguidade": 0.8, "vagueza": 0.2}

    result = score_analysis(probabilities, threshold=0.5)

    assert result["score"] == pytest.approx(0.5)
    assert result["metrics"] == probabilities
    assert result["warnings"] == [{"category": "ambiguidade", "confidence": 0.8}]


def test_estrategia_desconhecida_levanta_erro():
    """SC-5: estratégia inválida falha de forma explícita."""
    with pytest.raises(ValueError):
        compute_score({"ambiguidade": 0.5}, strategy="inexistente")


def test_probabilidades_vazias_levanta_erro():
    """Sem probabilidades não há score válido a calcular."""
    with pytest.raises(ValueError):
        compute_score({})
