"""Testes unitários para app.models.analysis — validação dos modelos Pydantic."""

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.models.analysis import AnalysisCreateRequest, AnalysisResponse

# ---------- AnalysisCreateRequest — Happy Path ----------


def test_analysis_create_request_aceita_dados_validos():
    request = AnalysisCreateRequest(
        lawId="law-123",
        score=0.85,
        metrics={"ambiguidade": 0.1, "vagueza": 0.05},
        warnings=[{"category": "ambiguidade", "confidence": 0.9}],
        modelVersion="v1.0.0",
        cached=False,
    )
    assert request.lawId == "law-123"
    assert request.score == 0.85
    assert request.cached is False


def test_analysis_create_request_strip_whitespace():
    request = AnalysisCreateRequest(
        lawId="  law-456  ",
        score=0.5,
        metrics={},
        warnings=[],
        modelVersion="  v2.0  ",
    )
    assert request.lawId == "law-456"
    assert request.modelVersion == "v2.0"


def test_analysis_create_request_cached_padrao_false():
    request = AnalysisCreateRequest(
        lawId="law-789",
        score=0.0,
        metrics={},
        warnings=[],
        modelVersion="v1.0.0",
    )
    assert request.cached is False


# ---------- AnalysisCreateRequest — Bad Path ----------


def test_analysis_create_request_rejeita_score_negativo():
    with pytest.raises(ValidationError):
        AnalysisCreateRequest(
            lawId="law-123",
            score=-0.1,
            metrics={},
            warnings=[],
            modelVersion="v1.0.0",
        )


def test_analysis_create_request_rejeita_score_acima_de_1():
    with pytest.raises(ValidationError):
        AnalysisCreateRequest(
            lawId="law-123",
            score=1.5,
            metrics={},
            warnings=[],
            modelVersion="v1.0.0",
        )


def test_analysis_create_request_rejeita_law_id_vazio():
    with pytest.raises(ValidationError):
        AnalysisCreateRequest(
            lawId="",
            score=0.5,
            metrics={},
            warnings=[],
            modelVersion="v1.0.0",
        )


def test_analysis_create_request_rejeita_model_version_vazio():
    with pytest.raises(ValidationError):
        AnalysisCreateRequest(
            lawId="law-123",
            score=0.5,
            metrics={},
            warnings=[],
            modelVersion="",
        )


# ---------- AnalysisResponse — Happy Path ----------


def test_analysis_response_aceita_dados_validos():
    agora = datetime.now(timezone.utc)
    response = AnalysisResponse(
        id="analysis-001",
        lawId="law-123",
        score=0.92,
        metrics={"ambiguidade": 0.08},
        warnings=[],
        modelVersion="v1.0.0",
        cached=True,
        createdAt=agora,
    )
    assert response.id == "analysis-001"
    assert response.score == 0.92
    assert response.cached is True
    assert response.createdAt == agora


# ---------- AnalysisResponse — Bad Path ----------


def test_analysis_response_rejeita_campos_obrigatorios_ausentes():
    with pytest.raises(ValidationError):
        AnalysisResponse(
            id="analysis-001",
            # lawId ausente
            score=0.5,
            metrics={},
            warnings=[],
            modelVersion="v1.0.0",
            cached=False,
            createdAt=datetime.now(timezone.utc),
        )
