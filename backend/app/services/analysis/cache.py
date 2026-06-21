"""Cache de resultados de análise por hash de texto + versão de modelo (D4).

Reduz latência e custo: a mesma lei avaliada na mesma versão de modelo não é
reprocessada. Uma nova ``model_version`` invalida o cache naturalmente, porque
muda a chave. A implementação é em memória (por processo) e fica atrás de uma
interface pequena, podendo evoluir para Redis/banco sem mudar os chamadores.
"""

from __future__ import annotations

import hashlib
from typing import Any


class AnalysisCache:
    """Cache simples em memória chaveado por hash(texto + model_version)."""

    def __init__(self) -> None:
        self._store: dict[str, dict[str, Any]] = {}

    @staticmethod
    def make_key(texto: str, model_version: str) -> str:
        """Gera a chave de cache combinando versão do modelo e texto."""
        payload = f"{model_version}:{texto}".encode("utf-8")
        return hashlib.sha256(payload).hexdigest()

    def get(self, key: str) -> dict[str, Any] | None:
        """Retorna o resultado armazenado ou ``None`` se não houver."""
        return self._store.get(key)

    def set(self, key: str, value: dict[str, Any]) -> None:
        """Armazena o resultado para a chave informada."""
        self._store[key] = value

    def clear(self) -> None:
        """Esvazia o cache (útil em testes)."""
        self._store.clear()
