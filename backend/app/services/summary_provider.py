from __future__ import annotations

from abc import ABC, abstractmethod
import os
import httpx


class SummaryError(Exception):
    """Exceção personalizada para falhas na geração de resumo por IA."""

    pass


class SummaryProvider(ABC):
    """Interface estável para serviços de geração de resumo automático.

    Permite isolar a chamada e a engenharia de prompts da lógica de negócios e
    facilitar a simulação de respostas em testes (TDD).
    """

    @abstractmethod
    async def summarize(self, texto: str) -> str:
        raise NotImplementedError


class MockSummaryProvider(SummaryProvider):

    async def summarize(self, texto: str) -> str:
        limpo = texto.strip()
        if not limpo:
            raise ValueError("Texto não pode ser vazio para sumarização.")

        trecho = limpo[:50] + "..." if len(limpo) > 50 else limpo
        return f"Resumo simulado da lei contendo o trecho: {trecho}"


class GeminiSummaryProvider(SummaryProvider):

    def __init__(
        self,
        api_key: str | None = None,
        model_name: str | None = None,
    ) -> None:
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name or os.getenv(
            "GEMINI_MODEL_NAME", "gemini-1.5-flash"
        )

    async def summarize(self, texto: str) -> str:
        limpo = texto.strip()
        if not limpo:
            raise ValueError("Texto não pode ser vazio para sumarização.")

        if not self.api_key:
            raise ValueError("GEMINI_API_KEY não configurada no ambiente.")

        url = (
            "https://generativelanguage.googleapis.com/"
            "v1beta/models/"
            f"{self.model_name}:generateContent?key={self.api_key}"
        )

        prompt = (
            "Você é um assistente jurídico "
            "especializado em simplificar textos legais.\n"
            "Escreva um resumo curto (parágrafo único, "
            "máximo 3 sentenças) em linguagem clara e "
            "acessível do seguinte texto legislativo:\n\n"
            f"{limpo}"
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "maxOutputTokens": 150,
                "temperature": 0.1,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload)

            if response.status_code != 200:
                raise SummaryError(
                    f"Erro de API Gemini ({response.status_code}): " f"{response.text}"
                )

            data = response.json()
            parts = data["candidates"][0]["content"]["parts"]
            summary = parts[0]["text"].strip()
            return summary

        except httpx.HTTPError as e:
            raise SummaryError(f"Falha na requisição de rede: {str(e)}")
        except (KeyError, IndexError) as e:
            raise SummaryError(f"Formato inesperado na resposta da API: {str(e)}")
        except Exception as e:
            if not isinstance(e, SummaryError):
                raise SummaryError(f"Erro inesperado na sumarização: {str(e)}")
            raise e
