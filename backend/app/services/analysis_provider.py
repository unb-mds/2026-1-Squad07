"""Interface de inferência de análise legislativa e implementação LegalBERT-pt.

O classificador real fica atrás da interface estável ``AnalysisProvider``
(decisão D2 da spec), permitindo trocar o modelo sem alterar o restante do
backend. O ``LegalBERTProvider`` carrega o modelo de forma preguiçosa
(``transformers`` + ``torch``) e trata textos acima de 512 tokens com
chunking + pooling por média (decisão D8 / REQ-011).
"""

from __future__ import annotations

import math
from abc import ABC, abstractmethod

# Taxonomia inicial da R2 (REQ-015). Ampliar exige nova ``MODEL_VERSION``.
TAXONOMY: tuple[str, ...] = (
    "ambiguidade",
    "vagueza",
    "falta_referencia",
    "inconsistencia",
)

# Mensagem padrão por categoria, usada para compor os warnings (code/message).
CATEGORY_MESSAGES: dict[str, str] = {
    "ambiguidade": (
        "Possível ambiguidade: termos ou dispositivos com mais de " "uma interpretação."
    ),
    "vagueza": (
        "Possível vagueza: conceitos indeterminados sem critério " "objetivo aplicável."
    ),
    "falta_referencia": (
        "Possível falta de referência: norma, artigo ou prazo não "
        "identificado no texto."
    ),
    "inconsistencia": (
        "Possível inconsistência: contradição interna entre "
        "dispositivos ou com a legislação citada."
    ),
}

# Versão do modelo usada no cache e na persistência (D4).
MODEL_VERSION = "legalbert-pt-v1"

# Modelo base auto-hospedado (D2/D10). Pode evoluir para um checkpoint
# fine-tunado sem alterar a interface.
DEFAULT_MODEL_NAME = "raquelsilveira/legalbertpt_fp"

# Limite de tokens do BERT; textos maiores são divididos (D8).
MAX_TOKENS = 512


def sigmoid(value: float) -> float:
    """Converte um logit em probabilidade no intervalo (0, 1)."""
    return 1.0 / (1.0 + math.exp(-value))


class AnalysisProvider(ABC):
    """Contrato estável de classificação multi-label de problemas do texto.

    Implementações recebem o texto e devolvem a probabilidade por categoria da
    taxonomia. Manter esta interface permite trocar o modelo (ou movê-lo para um
    microserviço) sem mudar o scoring, o cache ou os endpoints.
    """

    model_version: str = MODEL_VERSION

    @abstractmethod
    def analyze(self, texto: str) -> dict[str, float]:
        """Retorna ``{categoria: probabilidade}`` para todas as categorias."""
        raise NotImplementedError  # pragma: no cover


class LegalBERTProvider(AnalysisProvider):
    """Classificador multi-label baseado no LegalBERT-pt, auto-hospedado."""

    model_version = MODEL_VERSION

    def __init__(
        self,
        model_name: str = DEFAULT_MODEL_NAME,
        *,
        max_tokens: int = MAX_TOKENS,
        labels: tuple[str, ...] = TAXONOMY,
        tokenizer=None,
        model=None,
    ) -> None:
        self.model_name = model_name
        self.max_tokens = max_tokens
        self.labels = labels
        # Permite injeção nos testes; em produção carregam preguiçosamente.
        self._tokenizer = tokenizer
        self._model = model

    def analyze(self, texto: str) -> dict[str, float]:
        """Classifica o texto, tratando textos longos com chunking + pooling."""
        token_ids = self._encode(texto)
        chunks = self._chunk(token_ids)
        if not chunks:
            raise ValueError("Texto sem tokens para análise.")

        # Probabilidade por categoria em cada chunk.
        chunk_probabilities = [
            [sigmoid(logit) for logit in self._infer_logits(chunk)] for chunk in chunks
        ]

        pooled = self._mean_pool(chunk_probabilities)
        return dict(zip(self.labels, pooled))

    def _chunk(self, token_ids: list[int]) -> list[list[int]]:
        """Divide a sequência de tokens em janelas de no máximo ``max_tokens``."""
        chunks = []
        for start in range(0, len(token_ids), self.max_tokens):
            end = start + self.max_tokens
            chunks.append(token_ids[start:end])
        return chunks

    def _mean_pool(self, chunk_probabilities: list[list[float]]) -> list[float]:
        """Faz o pooling por média das probabilidades entre os chunks."""
        n_chunks = len(chunk_probabilities)
        n_labels = len(self.labels)
        return [
            sum(chunk[index] for chunk in chunk_probabilities) / n_chunks
            for index in range(n_labels)
        ]

    def _encode(self, texto: str) -> list[int]:
        """Tokeniza o texto em ids, sem tokens especiais (para chunking)."""
        self._ensure_loaded()
        return list(self._tokenizer.encode(texto, add_special_tokens=False))

    def _infer_logits(self, chunk: list[int]) -> list[float]:
        """Roda o modelo em um chunk e devolve um logit por categoria."""
        import torch  # pragma: no cover

        self._ensure_loaded()  # pragma: no cover
        with torch.no_grad():  # pragma: no cover
            input_ids = torch.tensor([chunk])  # pragma: no cover
            outputs = self._model(input_ids=input_ids)  # pragma: no cover
            return outputs.logits[0].tolist()  # pragma: no cover

    def _ensure_loaded(self) -> None:
        """Carrega tokenizer e modelo sob demanda (auto-hospedado, D2)."""
        if self._tokenizer is not None and self._model is not None:
            return
        from pathlib import Path  # pragma: no cover
        from transformers import (  # pragma: no cover
            AutoModelForSequenceClassification,
            AutoTokenizer,
        )

        current_dir = Path(__file__).resolve().parent  # pragma: no cover
        local_model_path = current_dir / ".." / "models" / "fine_tuned_legalbert"  # pragma: no cover

        model_to_load = self.model_name  # pragma: no cover
        if (local_model_path / "config.json").exists():  # pragma: no cover
            model_to_load = str(local_model_path.resolve())  # pragma: no cover

        if self._tokenizer is None:  # pragma: no cover
            self._tokenizer = AutoTokenizer.from_pretrained(model_to_load)
        if self._model is None:  # pragma: no cover
            self._model = AutoModelForSequenceClassification.from_pretrained(
                model_to_load,
                num_labels=len(self.labels),
                problem_type="multi_label_classification",
            )
