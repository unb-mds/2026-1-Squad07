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
            "Você é um assistente jurídico especializado em simplificar "
            "textos legais para o cidadão comum.\n"
            "Com base no texto legislativo fornecido, escreva um resumo "
            "explicativo conciso (parágrafo único, de 1 a 3 sentenças) "
            "que seja informativo e fácil de entender.\n"
            "O resumo DEVE identificar claramente:\n"
            "1. O objetivo principal e o tema central do documento "
            "(ex: o que está sendo regulamentado, instituído ou proibido).\n"
            "2. As principais medidas ou regras estabelecidas.\n\n"
            "Instruções importantes:\n"
            "- Use linguagem direta, acessível e sem jargões jurídicos "
            "excessivos.\n"
            "- Evite resumos extremamente genéricos (como 'Esta lei cria "
            "regras' ou 'Este artigo altera a legislação'). Seja específico "
            "sobre o conteúdo do texto.\n"
            "- Mantenha o tom neutro e profissional.\n\n"
            f"Texto legislativo:\n{limpo}"
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "maxOutputTokens": 250,
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
