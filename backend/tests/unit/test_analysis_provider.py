"""Testes do provider: interface, chunking e pooling (D8/REQ-011).

O modelo real (transformers/torch) é sempre substituído: um tokenizer falso
devolve ids determinísticos e ``_infer_logits`` é monkeypatchado para devolver
logits canônicos. Nenhum peso é baixado.
"""

import math

import pytest

from app.services.analysis_provider import (
    MAX_TOKENS,
    MODEL_VERSION,
    TAXONOMY,
    AnalysisProvider,
    LegalBERTProvider,
    sigmoid,
)


class FakeTokenizer:
    """Tokenizer falso: 1 token por caractere do texto."""

    def encode(self, texto, add_special_tokens=False):
        return list(range(len(texto)))


def make_provider(monkeypatch, logits_por_chunk):
    """Cria um provider com tokenizer falso e logits fixos por chunk."""
    provider = LegalBERTProvider(tokenizer=FakeTokenizer(), model=object())

    calls = {"count": 0}

    def fake_infer(chunk):
        calls["count"] += 1
        return logits_por_chunk

    monkeypatch.setattr(provider, "_infer_logits", fake_infer)
    return provider, calls


def test_interface_abstrata_nao_instanciavel():
    """PR-6: AnalysisProvider é um contrato abstrato."""
    with pytest.raises(TypeError):
        AnalysisProvider()


def test_model_version_exposto():
    """PR-4: o provider expõe uma versão de modelo estável."""
    assert LegalBERTProvider().model_version == MODEL_VERSION
    assert MODEL_VERSION


def test_sigmoid_converte_logit_em_probabilidade():
    """Sigmoid mapeia logits para (0, 1)."""
    assert sigmoid(0.0) == pytest.approx(0.5)
    assert sigmoid(100.0) == pytest.approx(1.0)
    assert sigmoid(-100.0) == pytest.approx(0.0, abs=1e-6)


def test_texto_curto_gera_um_chunk_e_quatro_categorias(monkeypatch):
    """PR-1: texto curto -> 1 chunk; saída com as 4 categorias."""
    logits = [0.0, 0.0, 0.0, 0.0]
    provider, calls = make_provider(monkeypatch, logits)

    result = provider.analyze("texto curto")

    assert set(result.keys()) == set(TAXONOMY)
    assert calls["count"] == 1
    # logit 0 -> probabilidade 0.5
    assert all(value == pytest.approx(0.5) for value in result.values())


def test_texto_longo_e_dividido_em_varios_chunks(monkeypatch):
    """PR-2: texto acima de 512 tokens vira vários chunks (D8)."""
    logits = [0.0, 0.0, 0.0, 0.0]
    provider, calls = make_provider(monkeypatch, logits)

    texto = "x" * (MAX_TOKENS * 2 + 10)
    n_tokens = len(texto)
    esperado = math.ceil(n_tokens / MAX_TOKENS)

    provider.analyze(texto)

    assert calls["count"] == esperado == 3


def test_pooling_e_media_entre_chunks(monkeypatch):
    """PR-3: a probabilidade final é a média por categoria entre chunks."""
    provider = LegalBERTProvider(tokenizer=FakeTokenizer(), model=object())

    # 2 chunks com logits diferentes; pooling deve usar a média das probs.
    logits_por_chunk = iter([[100.0, -100.0, 0.0, 0.0], [-100.0, 100.0, 0.0, 0.0]])
    monkeypatch.setattr(provider, "_infer_logits", lambda chunk: next(logits_por_chunk))

    texto = "y" * (MAX_TOKENS + 1)  # garante 2 chunks
    result = provider.analyze(texto)

    # ambiguidade: média(1.0, 0.0) = 0.5 ; vagueza: média(0.0, 1.0) = 0.5
    assert result["ambiguidade"] == pytest.approx(0.5)
    assert result["vagueza"] == pytest.approx(0.5)
    assert result["falta_referencia"] == pytest.approx(0.5)


def test_texto_sem_tokens_levanta_erro(monkeypatch):
    """PR-5: texto que não gera tokens falha explicitamente (D6)."""
    provider, _ = make_provider(monkeypatch, [0.0, 0.0, 0.0, 0.0])

    with pytest.raises(ValueError):
        provider.analyze("")
