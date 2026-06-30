"""Testes de integração dos endpoints de análise (mocks do modelo).

Contratos conforme `docs/architecture/ai-integration.md`:
`POST /api/v1/analysis/evaluate`, `GET /api/v1/laws/{id}/analysis` e
`GET /api/v1/laws/{id}/history`.
"""

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

    def analyze(self, text):
        self.calls += 1
        if self.error is not None:
            raise self.error
        return {
            "ambiguidade": 0.8,
            "vagueza": 0.2,
            "falta_referencia": 0.1,
            "inconsistencia": 0.1,
        }


class FakeLawDelegate:
    def __init__(self, laws=None):
        self.laws = laws or {}

    async def find_unique(self, where):
        return self.laws.get(where["id"])


class FakeAnalysisDelegate:
    def __init__(self, rows=None):
        self.created = []
        self.rows = rows or []

    async def create(self, data):
        self.created.append(data)
        return SimpleNamespace(id="analysis-new", **data)

    async def find_first(self, **kwargs):
        rows = self._for_law(kwargs["where"]["lawId"])
        return rows[0] if rows else None

    async def find_many(self, **kwargs):
        return self._for_law(kwargs["where"]["lawId"])

    def _for_law(self, law_id):
        return [row for row in self.rows if row.lawId == law_id]


def make_row(row_id, law_id, score, created):
    return SimpleNamespace(
        id=row_id,
        lawId=law_id,
        score=score,
        metrics={"ambiguidade": 0.4, "vagueza": 0.3},
        warnings=[
            {"code": "ambiguidade", "message": "msg", "confidence": 0.4}
        ],
        modelVersion="fake-v1",
        cached=False,
        createdAt=created,
        summary="Resumo da lei.",
    )


def setup_fakes(
    monkeypatch, provider=None, laws=None, rows=None, summary_provider=None
):
    """Substitui provider, cache, db e summary_provider por dublês."""
    from app.services.summary_provider import MockSummaryProvider

    provider = provider or FakeProvider()
    summary_provider = summary_provider or MockSummaryProvider()
    law_delegate = FakeLawDelegate(laws)
    analysis_delegate = FakeAnalysisDelegate(rows)
    monkeypatch.setattr(analysis, "provider", provider)
    monkeypatch.setattr(analysis, "cache", AnalysisCache())
    monkeypatch.setattr(analysis, "summary_provider", summary_provider)
    monkeypatch.setattr(
        analysis,
        "db",
        SimpleNamespace(law=law_delegate, analysis=analysis_delegate),
    )
    return provider, law_delegate, analysis_delegate


# --- POST /api/v1/analysis/evaluate ---------------------------------------


def test_evaluate_retorna_schema_completo(monkeypatch):
    setup_fakes(monkeypatch)

    response = client.post(
        "/api/v1/analysis/evaluate",
        json={"text": "Art. 1...", "type": "bill"},
    )

    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {
        "analysis_id",
        "status",
        "score",
        "summary",
        "metrics",
        "warnings",
        "model_version",
        "cached",
    }
    assert body["status"] == "completed"
    assert body["cached"] is False
    assert body["model_version"] == "fake-v1"
    assert body["metrics"]["ambiguidade"] == 0.8
    assert body["summary"] == (
        "Resumo simulado da lei contendo o trecho: Art. 1..."
    )
    warning = body["warnings"][0]
    assert warning["code"] == "ambiguidade"
    assert warning["message"]
    assert warning["confidence"] == 0.8


def test_evaluate_texto_vazio_retorna_422(monkeypatch):
    """EP-2: texto vazio é rejeitado pela validação de schema."""
    setup_fakes(monkeypatch)

    response = client.post(
        "/api/v1/analysis/evaluate", json={"text": "", "type": "bill"}
    )

    assert response.status_code == 422


def test_evaluate_sem_type_retorna_422(monkeypatch):
    """EP-2: type é obrigatório no contrato."""
    setup_fakes(monkeypatch)

    response = client.post(
        "/api/v1/analysis/evaluate", json={"text": "Art. 1"}
    )

    assert response.status_code == 422


def test_evaluate_type_invalido_retorna_422(monkeypatch):
    """EP-2: type fora do enum bill|amendment é rejeitado."""
    setup_fakes(monkeypatch)

    response = client.post(
        "/api/v1/analysis/evaluate", json={"text": "Art. 1", "type": "lei"}
    )

    assert response.status_code == 422


def test_evaluate_segunda_chamada_e_cacheada(monkeypatch):
    """EP-3: a segunda chamada idêntica retorna cached=True."""
    provider, _, _ = setup_fakes(monkeypatch)

    payload = {"text": "mesmo texto de lei", "type": "bill"}
    first = client.post("/api/v1/analysis/evaluate", json=payload)
    second = client.post("/api/v1/analysis/evaluate", json=payload)

    assert first.json()["cached"] is False
    assert second.json()["cached"] is True
    assert provider.calls == 1


def test_evaluate_com_law_id_inexistente_retorna_404(monkeypatch):
    """EP-4: law_id que não existe retorna 404, sem analisar."""
    provider, _, _ = setup_fakes(monkeypatch)

    response = client.post(
        "/api/v1/analysis/evaluate",
        json={"text": "Art. 1", "type": "bill", "lawId": "nao-existe"},
    )

    assert response.status_code == 404
    assert provider.calls == 0


def test_evaluate_persiste_com_law_existente(monkeypatch):
    """EP-5: com lawId de lei existente, persiste a análise."""
    laws = {"law-7": SimpleNamespace(id="law-7")}
    _, _, delegate = setup_fakes(monkeypatch, laws=laws)

    response = client.post(
        "/api/v1/analysis/evaluate",
        json={"text": "Art. 1", "type": "amendment", "lawId": "law-7"},
    )

    assert response.status_code == 200
    assert len(delegate.created) == 1
    assert delegate.created[0]["law"] == {"connect": {"id": "law-7"}}


def test_evaluate_falha_do_modelo_retorna_503(monkeypatch):
    """EP-6: falha do modelo retorna 503, sem score simulado."""
    provider = FakeProvider(error=RuntimeError("indisponível"))
    setup_fakes(monkeypatch, provider=provider)

    response = client.post(
        "/api/v1/analysis/evaluate", json={"text": "Art. 1", "type": "bill"}
    )

    assert response.status_code == 503
    assert "score" not in response.json()


# --- GET /api/v1/laws/{id}/analysis ---------------------------------------


def test_latest_analysis_retorna_mais_recente(monkeypatch):
    now = datetime(2026, 6, 1, 12, 0, tzinfo=timezone.utc)
    rows = [make_row("a-2", "law-7", 0.6, now)]
    laws = {"law-7": SimpleNamespace(id="law-7")}
    setup_fakes(monkeypatch, laws=laws, rows=rows)

    response = client.get("/api/v1/laws/law-7/analysis")

    assert response.status_code == 200
    body = response.json()
    assert body["analysis_id"] == "a-2"
    assert body["status"] == "completed"
    assert body["score"] == 0.6
    assert body["summary"] == "Resumo da lei."


def test_latest_analysis_lei_inexistente_retorna_404(monkeypatch):
    """EP-8: lei inexistente retorna 404."""
    setup_fakes(monkeypatch)

    response = client.get("/api/v1/laws/nao-existe/analysis")

    assert response.status_code == 404


def test_latest_analysis_lei_sem_analise_retorna_404(monkeypatch):
    """EP-8: lei existente sem análise retorna 404, sem simular."""
    laws = {"law-7": SimpleNamespace(id="law-7")}
    setup_fakes(monkeypatch, laws=laws, rows=[])

    response = client.get("/api/v1/laws/law-7/analysis")

    assert response.status_code == 404


# --- GET /api/v1/laws/{id}/history ----------------------------------------


def test_history_retorna_itens_da_lei(monkeypatch):
    """EP-9: histórico retorna timestamp, score e model_version por lei."""
    now = datetime(2026, 6, 1, 12, 0, tzinfo=timezone.utc)
    rows = [
        make_row("a-2", "law-7", 0.6, now),
        make_row("a-1", "law-7", 0.4, now),
    ]
    laws = {"law-7": SimpleNamespace(id="law-7")}
    setup_fakes(monkeypatch, laws=laws, rows=rows)

    response = client.get("/api/v1/laws/law-7/history")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert set(body[0].keys()) == {"timestamp", "score", "model_version"}
    assert body[0]["score"] == 0.6
    assert body[0]["model_version"] == "fake-v1"


def test_history_lei_inexistente_retorna_404(monkeypatch):
    """EP-10: lei inexistente retorna 404."""
    setup_fakes(monkeypatch)

    response = client.get("/api/v1/laws/nao-existe/history")

    assert response.status_code == 404
