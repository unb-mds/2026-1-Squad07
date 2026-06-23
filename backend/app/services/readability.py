import re

TRITONGOS_RE = re.compile(r"uai|uei|uia|uio|uou|uem|uam", re.IGNORECASE)
DITONGOS_RE = re.compile(
    r"ai|ae|ao|au|ei|eo|eu|oi|oe|ou|ui|iu|ia|ie|io|ua|ue|uo|ão|ãe|õe|[aáã]m$|[eéê]m$",
    re.IGNORECASE,
)
VOGAIS_RE = re.compile(r"[aeiouyáéíóúâêîôûàèìòùãõäëïöü]", re.IGNORECASE)

PALAVRAS_RE = re.compile(
    r"[a-zA-ZáéíóúâêîôûàèìòùãõäëïöüçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÄËÏÖÜÇ]+", re.IGNORECASE
)


def contar_palavras(texto: str) -> int:
    """Conta palavras alfabéticas válidas no texto, ignorando símbolos e pontuações soltas."""
    if not texto or not texto.strip():
        return 0

    palavras = PALAVRAS_RE.findall(texto)
    return len(palavras)


def contar_frases(texto: str) -> int:
    """Conta a quantidade de frases no texto, tratando abreviações legislativas e numerais."""
    if not texto or not texto.strip():
        return 0

    texto_temp = re.sub(
        r"\b(Art|Inc|Al|Par|fl|doc)\.", r"\1_TEMP_", texto, flags=re.IGNORECASE
    )

    texto_temp = re.sub(
        r"\b(Art|Inc|Al|Par|fl|doc)_TEMP_\s+(\d+[ºoaª]?|[a-zA-Z]|[IVXLCDM]+|único)\.",
        r"\1_TEMP_ \2_TEMP_",
        texto_temp,
        flags=re.IGNORECASE,
    )

    frases = re.split(r"[.!?](?:\s+|\n|$)", texto_temp)

    frases = [f for f in frases if f.strip()]

    return len(frases)


def contar_silabas(palavra: str) -> int:
    """Conta as sílabas de uma palavra em português utilizando heurística de núcleos vocálicos."""
    palavra = palavra.lower().strip()
    if not palavra:
        return 0

    total_vogais = len(VOGAIS_RE.findall(palavra))

    palavra_sem_tritongos, total_tritongos = TRITONGOS_RE.subn("X", palavra)

    _, total_ditongos = DITONGOS_RE.subn("X", palavra_sem_tritongos)

    silabas = total_vogais - total_ditongos - (2 * total_tritongos)

    return max(1, silabas)


def classificar_score(score: float) -> str:
    """Classifica o score de legibilidade do Flesch nas faixas correspondentes."""
    if score <= 30.0:
        return "Muito dificil"
    elif score <= 50.0:
        return "Dificil"
    elif score <= 70.0:
        return "Medio"
    else:
        return "Facil"


def calcular_score(texto: str) -> dict:
    """Calcula o score de legibilidade Flesch-Kincaid adaptado para português brasileiro."""
    num_palavras = contar_palavras(texto)
    num_frases = contar_frases(texto)

    if num_palavras == 0 or num_frases == 0:
        return {
            "score": 0.0,
            "classificacao": "Muito dificil",
            "metricas": {"palavras": 0, "frases": 0, "silabas": 0},
        }

    palavras = PALAVRAS_RE.findall(texto)
    num_silabas = sum(contar_silabas(p) for p in palavras)

    score = (
        248.835
        - 1.015 * (num_palavras / num_frases)
        - 84.6 * (num_silabas / num_palavras)
    )

    score_final = max(0.0, min(100.0, round(score, 2)))

    score_final = float(score_final)

    return {
        "score": score_final,
        "classificacao": classificar_score(score_final),
        "metricas": {
            "palavras": num_palavras,
            "frases": num_frases,
            "silabas": num_silabas,
        },
    }
