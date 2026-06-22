"""Testes do cache por hash de texto + versão de modelo (D4)."""

from app.services.analysis.cache import AnalysisCache


def test_chave_igual_para_mesmo_texto_e_versao():
    """CA-1: mesma entrada -> mesma chave."""
    key_a = AnalysisCache.make_key("texto da lei", "v1")
    key_b = AnalysisCache.make_key("texto da lei", "v1")

    assert key_a == key_b


def test_chave_diferente_para_texto_diferente():
    """CA-2: textos diferentes -> chaves diferentes."""
    assert AnalysisCache.make_key("lei A", "v1") != AnalysisCache.make_key(
        "lei B", "v1"
    )


def test_chave_diferente_para_versao_diferente():
    """CA-3: nova versão de modelo invalida o cache."""
    assert AnalysisCache.make_key("lei", "v1") != AnalysisCache.make_key("lei", "v2")


def test_get_set_round_trip():
    """CA-4: get devolve o valor armazenado por set."""
    cache = AnalysisCache()
    key = AnalysisCache.make_key("lei", "v1")

    assert cache.get(key) is None

    cache.set(key, {"score": 0.7})
    assert cache.get(key) == {"score": 0.7}


def test_clear_esvazia_o_cache():
    """clear remove as entradas armazenadas."""
    cache = AnalysisCache()
    key = AnalysisCache.make_key("lei", "v1")
    cache.set(key, {"score": 0.1})

    cache.clear()

    assert cache.get(key) is None
