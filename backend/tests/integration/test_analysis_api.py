"""Testes de integração dos endpoints de análise (mocks do modelo)."""

from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api import analysis
from app.main import app
from app.services.analysis.cache import AnalysisCache

client = TestClient(app)


class FakeProvider:
    model_version = "fake-v1"

    def __init__(self, error=None):
        self.error = error
        self.calls = 0

    def analyze(self, texto):
        self.calls += 1
        if self.error is not None:
            raise self.error
        return {
            "ambiguidade": 0.8,
            "vagueza": 0.2,
            "falta_referencia": 0.1,
            "inconsistencia": 0.1,
        }


class FakeAnalysisDelegate:
    def __init__(self, rows=None):
        self.created = []
        self.find_many_args = None
        self.rows = rows or []

    async def create(self, data):
        self.created.append(data)
        return SimpleNamespace(id="analysis-1", **data)

    async def find_many(self, **kwargs):
        self.find_many_args = kwargs
        return self.rows


def setup_module_fakes(monkeypatch, provider=None, delegate=None):
    """Substitui provider, cache e db do módulo de rotas por dublês."""
    provider = provider or FakeProvider()
    delegate = delegate or FakeAnalysisDelegate()
    monkeypatch.setattr(analysis, "provider", provider)
    monkeypatch.setattr(analysis, "cache", AnalysisCache())
    monkeypatch.setattr(analysis, "db", SimpleNamespace(analysis=delegate))
    return provider, delegate


def test_evaluate_retorna_schema_completo(monkeypatch):
    """EP-1: a resposta contém score, metrics, warnings, model_version, cached."""
    setup_module_fakes(monkeypatch)

    response = client.post("/api/v1/analysis/evaluate", json={"texto": "Art. 1..."})

    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {
        "score",
        "metrics",
        "warnings",
        "model_version",
        "cached",
    }
    assert body["cached"] is False
    assert body["model_version"] == "fake-v1"
    assert body["metrics"]["ambiguidade"] == 0.8
    assert body["warnings"] == [{"category": "ambiguidade", "confidence": 0.8}]


def test_evaluate_texto_vazio_retorna_422(monkeypatch):
    """EP-2: texto vazio é rejeitado pela validação de schema."""
    setup_module_fakes(monkeypatch)

    response = client.post("/api/v1/analysis/evaluate", json={"texto": ""})

    assert response.status_code == 422


def test_evaluate_segunda_chamada_e_cacheada(monkeypatch):
    """EP-3: a segunda chamada idêntica retorna cached=True."""
    provider, _ = setup_module_fakes(monkeypatch)

    payload = {"texto": "mesmo texto de lei"}
    first = client.post("/api/v1/analysis/evaluate", json=payload)
    second = client.post("/api/v1/analysis/evaluate", json=payload)

    assert first.json()["cached"] is False
    assert second.json()["cached"] is True
    assert provider.calls == 1


def test_evaluate_persiste_quando_ha_law_id(monkeypatch):
    """EP-1/SV-3: com lawId, persiste a análise da lei."""
    _, delegate = setup_module_fakes(monkeypatch)

    response = client.post(
        "/api/v1/analysis/evaluate",
        json={"texto": "Art. 1...", "lawId": "law-7"},
    )

    assert response.status_code == 200
    assert len(delegate.created) == 1
    assert delegate.created[0]["law"] == {"connect": {"id": "law-7"}}


def test_evaluate_falha_do_modelo_retorna_502(monkeypatch):
    """EP-4: falha do modelo retorna erro explícito, sem score simulado."""
    provider = FakeProvider(error=RuntimeError("indisponível"))
    setup_module_fakes(monkeypatch, provider=provider)

    response = client.post("/api/v1/analysis/evaluate", json={"texto": "Art. 1..."})

    assert response.status_code == 502
    assert "score" not in response.json()


def test_history_retorna_analises_ordenadas(monkeypatch):
    """EP-5: histórico consulta por lawId em ordem desc."""
    now = datetime(2026, 6, 1, 12, 0, tzinfo=timezone.utc)
    rows = [
        SimpleNamespace(
            id="a-2",
            lawId="law-7",
            score=0.6,
            metrics={"ambiguidade": 0.4},
            warnings=[],
            modelVersion="fake-v1",
            cached=False,
            createdAt=now,
        ),
        SimpleNamespace(
            id="a-1",
            lawId="law-7",
            score=0.4,
            metrics={"ambiguidade": 0.6},
            warnings=[{"category": "ambiguidade", "confidence": 0.6}],
            modelVersion="fake-v1",
            cached=False,
            createdAt=now,
        ),
    ]
    delegate = FakeAnalysisDelegate(rows=rows)
    setup_module_fakes(monkeypatch, delegate=delegate)

    response = client.get("/api/v1/analysis/law-7/history")

    assert response.status_code == 200
    assert delegate.find_many_args == {
        "where": {"lawId": "law-7"},
        "order": {"createdAt": "desc"},
    }
    body = response.json()
    assert [item["id"] for item in body] == ["a-2", "a-1"]


def test_history_vazio_retorna_lista_vazia(monkeypatch):
    """EP-6: lei sem análises retorna lista vazia, sem inventar dados."""
    setup_module_fakes(monkeypatch, delegate=FakeAnalysisDelegate(rows=[]))

    response = client.get("/api/v1/analysis/law-sem-analise/history")

    assert response.status_code == 200
    assert response.json() == []
