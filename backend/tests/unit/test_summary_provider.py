import pytest
import httpx
from app.services.summary_provider import (
    SummaryError,
    MockSummaryProvider,
    GeminiSummaryProvider,
)


@pytest.mark.anyio
async def test_mock_summary_provider_retorna_resumo():
    provider = MockSummaryProvider()
    resumo = await provider.summarize(
        "Fica instituído o programa legislativo."
    )
    assert "Resumo simulado" in resumo
    assert "Fica instituído" in resumo


@pytest.mark.anyio
async def test_mock_summary_provider_texto_vazio_lanca_erro():
    provider = MockSummaryProvider()
    with pytest.raises(ValueError):
        await provider.summarize("   ")


@pytest.mark.anyio
async def test_gemini_summary_provider_sem_chave_lanca_erro():
    provider = GeminiSummaryProvider(api_key="")
    with pytest.raises(ValueError):
        await provider.summarize("texto")


@pytest.mark.anyio
async def test_gemini_summary_provider_texto_vazio_lanca_erro():
    provider = GeminiSummaryProvider(api_key="key")
    with pytest.raises(ValueError):
        await provider.summarize("   ")


@pytest.mark.anyio
async def test_gemini_summary_provider_sucesso(monkeypatch):
    class FakeResponse:
        status_code = 200

        def json(self):
            return {
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {"text": "Resumo real gerado pela IA."}
                            ]
                        }
                    }
                ]
            }

    calls = []

    async def fake_post(client_self, url, **kwargs):
        calls.append((url, kwargs))
        return FakeResponse()

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)

    provider = GeminiSummaryProvider(api_key="fake-key")
    resumo = await provider.summarize("Algum texto legislativo para resumir.")

    assert resumo == "Resumo real gerado pela IA."
    assert len(calls) == 1


@pytest.mark.anyio
async def test_gemini_summary_provider_erro_http(monkeypatch):
    class FakeResponse:
        status_code = 400
        text = "Bad Request"

    async def fake_post(client_self, url, **kwargs):
        return FakeResponse()

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)

    provider = GeminiSummaryProvider(api_key="fake-key")
    with pytest.raises(SummaryError) as exc_info:
        await provider.summarize("texto")
    assert "Erro de API Gemini (400)" in str(exc_info.value)


@pytest.mark.anyio
async def test_gemini_summary_provider_falha_de_rede(monkeypatch):
    async def fake_post(client_self, url, **kwargs):
        raise httpx.ConnectError("Erro de conexao")

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)

    provider = GeminiSummaryProvider(api_key="fake-key")
    with pytest.raises(SummaryError) as exc_info:
        await provider.summarize("texto")
    assert "Falha na requisição de rede" in str(exc_info.value)
