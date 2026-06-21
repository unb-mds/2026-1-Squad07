"""Testes da orquestração: cache, persistência e erros (D4/D6/D11)."""

from types import SimpleNamespace

import pytest

from app.services.analysis.cache import AnalysisCache
from app.services.analysis.service import AnalysisError, evaluate_text


class FakeProvider:
    """Provider falso com probabilidades fixas e contagem de chamadas."""

    model_version = "fake-v1"

    def __init__(self, probabilities=None, error=None):
        self.probabilities = probabilities or {
            "ambiguidade": 0.8,
            "vagueza": 0.2,
            "falta_referencia": 0.1,
            "inconsistencia": 0.1,
        }
        self.error = error
        self.calls = 0

    def analyze(self, texto):
        self.calls += 1
        if self.error is not None:
            raise self.error
        return self.probabilities


class FakeAnalysisDelegate:
    """Dublê do delegate Prisma para a tabela Analysis."""

    def __init__(self):
        self.created = []

    async def create(self, data):
        self.created.append(data)
        return SimpleNamespace(id="analysis-1", **data)


def make_db():
    return SimpleNamespace(analysis=FakeAnalysisDelegate())


async def test_primeira_chamada_computa_e_marca_cached_false():
    """SV-1: miss de cache computa e retorna cached=False."""
    provider = FakeProvider()
    cache = AnalysisCache()
    db = make_db()

    result = await evaluate_text("texto", None, provider=provider, cache=cache, db=db)

    assert result["cached"] is False
    assert result["model_version"] == "fake-v1"
    assert result["score"] == pytest.approx(0.7)
    assert result["metrics"] == provider.probabilities
    assert result["warnings"] == [{"category": "ambiguidade", "confidence": 0.8}]
    assert provider.calls == 1


async def test_segunda_chamada_retorna_cached_true_sem_reprocessar():
    """SV-2: hit de cache devolve cached=True e não chama o provider de novo."""
    provider = FakeProvider()
    cache = AnalysisCache()
    db = make_db()

    await evaluate_text("mesmo texto", None, provider=provider, cache=cache, db=db)
    second = await evaluate_text(
        "mesmo texto", None, provider=provider, cache=cache, db=db
    )

    assert second["cached"] is True
    assert provider.calls == 1


async def test_persiste_em_analysis_quando_ha_law_id():
    """SV-3: com law_id, o resultado é persistido em Analysis (D11)."""
    provider = FakeProvider()
    cache = AnalysisCache()
    db = make_db()

    await evaluate_text("texto", "law-42", provider=provider, cache=cache, db=db)

    assert len(db.analysis.created) == 1
    persisted = db.analysis.created[0]
    assert persisted["lawId"] == "law-42"
    assert persisted["modelVersion"] == "fake-v1"
    assert persisted["cached"] is False
    assert persisted["score"] == pytest.approx(0.7)


async def test_sem_law_id_nao_persiste():
    """SV-4: sem law_id, nada é gravado em Analysis."""
    provider = FakeProvider()
    cache = AnalysisCache()
    db = make_db()

    await evaluate_text("texto", None, provider=provider, cache=cache, db=db)

    assert db.analysis.created == []


async def test_falha_do_provider_nao_retorna_score_simulado():
    """SV-5: erro do modelo vira AnalysisError, sem score inventado (D6)."""
    provider = FakeProvider(error=RuntimeError("modelo indisponível"))
    cache = AnalysisCache()
    db = make_db()

    with pytest.raises(AnalysisError):
        await evaluate_text("texto", None, provider=provider, cache=cache, db=db)

    assert db.analysis.created == []
