"""Testes da orquestração: cache, persistência e erros (D4/D6/D11)."""

from types import SimpleNamespace

import pytest

from app.services.analysis.cache import AnalysisCache
from app.services.analysis.service import AnalysisError, evaluate_text
from app.services.summary_provider import SummaryError


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


class FakeSummaryProvider:
    def __init__(self, result="Resumo padrão.", error=None):
        self.result = result
        self.error = error
        self.calls = 0

    async def summarize(self, texto):
        self.calls += 1
        if self.error is not None:
            raise self.error
        return self.result


class FakeAnalysisDelegate:
    """Dublê do delegate Prisma para a tabela Analysis."""

    def __init__(self):
        self.created = []

    async def create(self, data):
        self.created.append(data)
        return SimpleNamespace(id="analysis-1", **data)


def make_db():
    return SimpleNamespace(analysis=FakeAnalysisDelegate())


@pytest.mark.anyio
async def test_primeira_chamada_computa_e_marca_cached_false():
    provider = FakeProvider()
    summary_provider = FakeSummaryProvider()
    cache = AnalysisCache()
    db = make_db()

    result = await evaluate_text(
        "texto",
        None,
        provider=provider,
        summary_provider=summary_provider,
        cache=cache,
        db=db,
    )

    assert result["cached"] is False
    assert result["status"] == "completed"
    assert result["analysis_id"]
    assert result["model_version"] == "fake-v1"
    assert result["score"] == pytest.approx(0.7)
    assert result["metrics"] == provider.probabilities
    assert [w["code"] for w in result["warnings"]] == ["ambiguidade"]
    assert provider.calls == 1


@pytest.mark.anyio
async def test_segunda_chamada_retorna_cached_true_sem_reprocessar():
    provider = FakeProvider()
    summary_provider = FakeSummaryProvider()
    cache = AnalysisCache()
    db = make_db()

    await evaluate_text(
        "mesmo texto",
        None,
        provider=provider,
        summary_provider=summary_provider,
        cache=cache,
        db=db,
    )
    second = await evaluate_text(
        "mesmo texto",
        None,
        provider=provider,
        summary_provider=summary_provider,
        cache=cache,
        db=db,
    )

    assert second["cached"] is True
    assert provider.calls == 1


@pytest.mark.anyio
async def test_persiste_em_analysis_quando_ha_law_id():
    provider = FakeProvider()
    summary_provider = FakeSummaryProvider()
    cache = AnalysisCache()
    db = make_db()

    result = await evaluate_text(
        "texto",
        "law-42",
        provider=provider,
        summary_provider=summary_provider,
        cache=cache,
        db=db,
    )

    assert result["analysis_id"] == "analysis-1"
    assert len(db.analysis.created) == 1
    persisted = db.analysis.created[0]
    assert persisted["law"] == {"connect": {"id": "law-42"}}
    assert persisted["modelVersion"] == "fake-v1"
    assert persisted["cached"] is False
    assert persisted["score"] == pytest.approx(0.7)
    assert persisted["metrics"].data == provider.probabilities
    assert [w["code"] for w in persisted["warnings"].data] == ["ambiguidade"]


@pytest.mark.anyio
async def test_cache_hit_com_law_id_ainda_persiste():
    provider = FakeProvider()
    summary_provider = FakeSummaryProvider()
    cache = AnalysisCache()
    db = make_db()

    await evaluate_text(
        "texto",
        None,
        provider=provider,
        summary_provider=summary_provider,
        cache=cache,
        db=db,
    )
    assert db.analysis.created == []

    result = await evaluate_text(
        "texto",
        "law-9",
        provider=provider,
        summary_provider=summary_provider,
        cache=cache,
        db=db,
    )

    assert result["cached"] is True
    assert provider.calls == 1
    assert len(db.analysis.created) == 1
    assert db.analysis.created[0]["law"] == {"connect": {"id": "law-9"}}
    assert db.analysis.created[0]["cached"] is True


@pytest.mark.anyio
async def test_sem_law_id_nao_persiste():
    provider = FakeProvider()
    summary_provider = FakeSummaryProvider()
    cache = AnalysisCache()
    db = make_db()

    await evaluate_text(
        "texto",
        None,
        provider=provider,
        summary_provider=summary_provider,
        cache=cache,
        db=db,
    )

    assert db.analysis.created == []


@pytest.mark.anyio
async def test_falha_do_provider_nao_retorna_score_simulado():
    provider = FakeProvider(error=RuntimeError("modelo indisponível"))
    summary_provider = FakeSummaryProvider()
    cache = AnalysisCache()
    db = make_db()

    with pytest.raises(AnalysisError):
        await evaluate_text(
            "texto",
            None,
            provider=provider,
            summary_provider=summary_provider,
            cache=cache,
            db=db,
        )

    assert db.analysis.created == []


@pytest.mark.anyio
async def test_primeira_chamada_gera_resumo_e_persiste():
    provider = FakeProvider()
    summary_provider = FakeSummaryProvider(result="Resumo da lei.")
    cache = AnalysisCache()
    db = make_db()

    result = await evaluate_text(
        "texto",
        "law-1",
        provider=provider,
        summary_provider=summary_provider,
        cache=cache,
        db=db,
    )

    assert result["summary"] == "Resumo da lei."
    assert len(db.analysis.created) == 1
    assert db.analysis.created[0]["summary"] == "Resumo da lei."
    assert summary_provider.calls == 1


@pytest.mark.anyio
async def test_segunda_chamada_retorna_resumo_do_cache():
    provider = FakeProvider()
    summary_provider = FakeSummaryProvider(result="Resumo da lei.")
    cache = AnalysisCache()
    db = make_db()

    await evaluate_text(
        "texto",
        None,
        provider=provider,
        summary_provider=summary_provider,
        cache=cache,
        db=db,
    )
    result = await evaluate_text(
        "texto",
        None,
        provider=provider,
        summary_provider=summary_provider,
        cache=cache,
        db=db,
    )

    assert result["summary"] == "Resumo da lei."
    assert summary_provider.calls == 1


@pytest.mark.anyio
async def test_falha_na_sumarizacao_nao_derruba_a_analise():
    provider = FakeProvider()
    summary_provider = FakeSummaryProvider(
        error=SummaryError("Erro no Gemini")
    )
    cache = AnalysisCache()
    db = make_db()

    result = await evaluate_text(
        "texto",
        "law-1",
        provider=provider,
        summary_provider=summary_provider,
        cache=cache,
        db=db,
    )

    assert result["summary"] is None
    assert result["status"] == "completed"
    assert db.analysis.created[0]["summary"] is None
    assert summary_provider.calls == 1
