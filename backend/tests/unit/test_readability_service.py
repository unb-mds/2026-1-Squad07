import pytest
from app.services.readability import (
    contar_palavras,
    contar_frases,
    contar_silabas,
    classificar_score,
    calcular_score,
)

def test_contar_palavras_happy_path():
    texto = "O gato subiu no telhado."
    assert contar_palavras(texto) == 5

def test_contar_palavras_bad_path():
    texto = "A lei - conforme previsto - deve passar § 2º."
    assert contar_palavras(texto) == 6

def test_contar_silabas_empty_e_comuns():
    assert contar_silabas("") == 0
    assert contar_silabas("   ") == 0
    assert contar_silabas("lei") == 1
    assert contar_silabas("constituição") == 4


def test_contar_frases_happy_path():
    texto = "Esta lei é clara. Ela dispõe sobre o tema."
    assert contar_frases(texto) == 2

def test_contar_frases_bad_path():
    texto = "Art. 1º. Esta lei dispõe sobre qualidade legislativa. Inc. I. Aplica-se ao processo."
    assert contar_frases(texto) == 2

def test_classificar_score():
    assert classificar_score(29.9) == "Muito dificil"
    assert classificar_score(30.0) == "Muito dificil"
    assert classificar_score(30.1) == "Dificil"
    assert classificar_score(50.0) == "Dificil"
    assert classificar_score(50.1) == "Medio"
    assert classificar_score(70.0) == "Medio"
    assert classificar_score(70.1) == "Facil"
    assert classificar_score(100.0) == "Facil"

def test_calcular_score_texto_vazio_ou_especial():
    for texto in ["", "   ", "@#$ %^&*"]:
        resultado = calcular_score(texto)
        assert resultado["score"] == 0.0
        assert resultado["classificacao"] == "Muito dificil"
        assert resultado["metricas"]["palavras"] == 0
        assert resultado["metricas"]["frases"] == 0
        assert resultado["metricas"]["silabas"] == 0

def test_calcular_score_happy_path():
    texto = "Fica instituído o regime especial."
    resultado = calcular_score(texto)
    assert resultado["metricas"]["palavras"] == 5
    assert resultado["metricas"]["frases"] == 1
    assert resultado["metricas"]["silabas"] == 14
    assert abs(resultado["score"] - 6.88) < 0.01
    assert resultado["classificacao"] == "Muito dificil"
