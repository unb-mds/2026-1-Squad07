"""Testes unitários para app.models.analysis — validação dos modelos Pydantic."""

from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from app.models.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisWarning,
    AnalysisHistoryItem,
    LawType,
    AnalysisStatus,
)

# ---------- AnalysisRequest ----------


def test_analysis_request_aceita_dados_validos():
    req = AnalysisRequest(
        text="Art. 1 O órgão competente poderá adotar as medidas cabíveis.",
        type=LawType.BILL,
        lawId="law-123",
    )
    assert req.text == "Art. 1 O órgão competente poderá adotar as medidas cabíveis."
    assert req.type == LawType.BILL
    assert req.lawId == "law-123"


def test_analysis_request_strip_whitespace():
    req = AnalysisRequest(
        text="   Art. 1 Com espaços.   ",
        type=LawType.AMENDMENT,
    )
    # ConfigDict(str_strip_whitespace=True) deve remover espaços extras
    assert req.text == "Art. 1 Com espaços."
    assert req.type == LawType.AMENDMENT
    assert req.lawId is None


def test_analysis_request_rejeita_texto_vazio():
    with pytest.raises(ValidationError):
        AnalysisRequest(
            text="",
            type=LawType.BILL,
        )


def test_analysis_request_rejeita_tipo_invalido():
    with pytest.raises(ValidationError):
        AnalysisRequest(
            text="Texto valido",
            type="tipo_inexistente",
        )


# ---------- AnalysisWarning ----------


def test_analysis_warning_aceita_dados_validos():
    warn = AnalysisWarning(
        code="W001",
        message="Possível ambiguidade estrutural",
        confidence=0.85,
    )
    assert warn.code == "W001"
    assert warn.message == "Possível ambiguidade estrutural"
    assert warn.confidence == 0.85


def test_analysis_warning_rejeita_confidence_fora_do_limite():
    with pytest.raises(ValidationError):
        AnalysisWarning(code="W001", message="Erro", confidence=-0.1)

    with pytest.raises(ValidationError):
        AnalysisWarning(code="W001", message="Erro", confidence=1.1)


# ---------- AnalysisResponse ----------


def test_analysis_response_aceita_dados_validos():
    resp = AnalysisResponse(
        analysis_id="analise-999",
        status=AnalysisStatus.COMPLETED,
        score=0.92,
        metrics={"ambiguidade": 0.08, "vagueza": 0.0},
        warnings=[
            AnalysisWarning(
                code="W001",
                message="Aviso",
                confidence=0.5,
            )
        ],
        model_version="v2.1",
        cached=True,
    )
    assert resp.analysis_id == "analise-999"
    assert resp.status == AnalysisStatus.COMPLETED
    assert resp.score == 0.92
    assert resp.cached is True


def test_analysis_response_rejeita_score_invalido():
    with pytest.raises(ValidationError):
        AnalysisResponse(
            analysis_id="analise-999",
            status=AnalysisStatus.COMPLETED,
            score=1.5,
            model_version="v1.0",
        )


# ---------- AnalysisHistoryItem ----------


def test_analysis_history_item_aceita_dados_validos():
    agora = datetime.now(timezone.utc)
    item = AnalysisHistoryItem(
        timestamp=agora,
        score=0.75,
        model_version="v1.0.0",
    )
    assert item.timestamp == agora
    assert item.score == 0.75
    assert item.model_version == "v1.0.0"


def test_analysis_history_item_rejeita_score_invalido():
    with pytest.raises(ValidationError):
        AnalysisHistoryItem(
            timestamp=datetime.now(timezone.utc),
            score=-0.5,
            model_version="v1.0.0",
        )
