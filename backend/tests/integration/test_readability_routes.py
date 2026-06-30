from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_analyze_readability_success():
    payload = {"texto": "Fica instituído o regime especial."}
    response = client.post("/api/v1/laws/readability", json=payload)

    assert response.status_code == 200

    data = response.json()
    assert "score" in data
    assert "classificacao" in data
    assert "metricas" in data

    assert data["metricas"]["palavras"] == 5
    assert data["metricas"]["frases"] == 1
    assert data["metricas"]["silabas"] == 14
    assert abs(data["score"] - 6.88) < 0.01
    assert data["classificacao"] == "Muito dificil"


def test_analyze_readability_empty_text():
    payload = {"texto": ""}
    response = client.post("/api/v1/laws/readability", json=payload)

    assert response.status_code == 422


def test_analyze_readability_invalid_type():
    payload = {"texto": 12345}
    response = client.post("/api/v1/laws/readability", json=payload)

    assert response.status_code == 422


def test_analyze_readability_missing_field():
    payload = {}
    response = client.post("/api/v1/laws/readability", json=payload)

    assert response.status_code == 422


def test_analyze_readability_inelegible_text():
    payload = {"texto": "  @#$ %^&*  "}
    response = client.post("/api/v1/laws/readability", json=payload)

    assert response.status_code == 400
    assert "Texto inválido" in response.json()["detail"]


def test_analyze_readability_internal_error():
    with patch(
        "app.api.laws.calcular_score",
        side_effect=RuntimeError("erro simulado"),
    ):
        response = client.post(
            "/api/v1/laws/readability", json={"texto": "Texto válido."}
        )

    assert response.status_code == 500
    assert (
        "Erro interno ao processar legibilidade"
        in response.json()["detail"]
    )
