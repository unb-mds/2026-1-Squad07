"""Coleta proposicoes reais da Camara dos Deputados e gera rotulos FRACOS.

Este script constroi um dataset de treino EXPANDIDO para o classificador do
CrivoAI a partir da API publica de Dados Abertos da Camara dos Deputados
(https://dadosabertos.camara.leg.br/). Ele:

1. Baixa a ``ementa`` (texto plano, confiavel e escalavel) de milhares de
   Projetos de Lei (PL) ao longo de varios anos.
2. Aplica uma rotulagem HEURISTICA AUTOMATICA (weak supervision) para as 4
   categorias da taxonomia (``ambiguidade``, ``vagueza``, ``falta_referencia``,
   ``inconsistencia``), com base em marcadores linguisticos.
3. Escreve os exemplos no mesmo schema de ``data/dataset_laws.json``.

AVISO IMPORTANTE (integridade estatistica)
------------------------------------------
Os rotulos gerados aqui sao FRACOS (weak labels): sao heuristicas de palavras-
chave, NAO anotacao humana revisada por pares. Servem para dar volume ao treino
e validar o pipeline em escala, mas:

* O F1 medido sobre estes dados reflete o quanto o modelo aprende a HEURISTICA,
  nao necessariamente a qualidade juridica real do texto.
* Antes de considerar o modelo pronto para producao, os rotulos devem ser
  revisados por humanos (Fase 1 do ``docs/dev/plano-expansao-ml.md``).
* A ``ementa`` e um resumo curto; o texto integral ("inteiro teor") fica atras
  de PDFs (campo ``urlInteiroTeor``) e nao e extraido aqui — melhoria futura.

Uso::

    .venv\\Scripts\\python.exe scripts\\build_dataset_camara.py \\
        --target 550 --out data\\dataset_laws_camara.json --include-seed
"""

from __future__ import annotations

import argparse
import json
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Iterable

BACKEND_DIR = Path(__file__).resolve().parent.parent
SEED_DATASET = BACKEND_DIR / "data" / "dataset_laws.json"
DEFAULT_OUT = BACKEND_DIR / "data" / "dataset_laws_camara.json"

API_BASE = "https://dadosabertos.camara.leg.br/api/v2"
LABELS: tuple[str, ...] = (
    "ambiguidade",
    "vagueza",
    "falta_referencia",
    "inconsistencia",
)

# ---------------------------------------------------------------------------
# Marcadores heuristicos (comparados sobre o texto normalizado: minusculo e
# SEM acentos). Sao deliberadamente conservadores; a cobertura importa menos
# que a precisao aproximada, dado que sao rotulos fracos.
# ---------------------------------------------------------------------------
VAGUEZA_MARKERS: tuple[str, ...] = (
    "razoavel",
    "razoabilidade",
    "adequad",
    "sempre que possivel",
    "quando possivel",
    "na medida do possivel",
    "a criterio",
    "criterio exclusivo",
    "conveniencia e oportunidade",
    "interesse social",
    "de forma geral",
    "amplo e indeterminado",
    "em tempo habil",
    "quando necessario",
    "se necessario",
    "bons costumes",
    "boa-fe",
    "notori",
    "excessiv",
    "quando couber",
    "no que couber",
    "medidas cabiveis",
    "providencias necessarias",
    "meios adequados",
    "condicoes dignas",
    "entre outros",
    "dentre outros",
    "e afins",
)
FALTA_REFERENCIA_MARKERS: tuple[str, ...] = (
    "legislacao vigente",
    "na forma da lei",
    "nos termos da lei",
    "conforme regulamento",
    "regulamento proprio",
    "decreto pertinente",
    "ato proprio",
    "norma regulamentadora",
    "conforme dispuser",
    "legislacao pertinente",
    "termos do regulamento",
    "conforme previsto em regulamento",
    "na forma do regulamento",
    "conforme a legislacao",
    "nos termos do regulamento",
    "de acordo com a legislacao",
    "sera regulamentad",
    "a ser regulamentad",
    "a ser definid em regulamento",
)
AMBIGUIDADE_MARKERS: tuple[str, ...] = (
    "e/ou",
    "ou outro",
    "ou qualquer",
    "conforme o caso",
    "salvo melhor juizo",
    "podera ou",
    "poderao ou",
    "quando for o caso",
    "entre outras hipoteses",
)
# Inconsistencia = co-ocorrencia de uma PROIBICAO forte com uma
# PERMISSAO/EXCECAO ampla (indicio de contradicao interna).
INCONSIST_PROHIBITION: tuple[str, ...] = (
    "proibi",
    "vedad",
    "e vedado",
    "fica proibid",
    "nao podera",
    "nao sera permitid",
    "terminantemente",
)
INCONSIST_OVERRIDE: tuple[str, ...] = (
    "livremente",
    "qualquer hora",
    "a qualquer tempo",
    "sem restric",
    "sem excecao",
    "todos os",
    "salvo",
    "exceto",
    "fica garantid",
)


def normalize(text: str) -> str:
    """Minusculo e sem acentos, para casar marcadores de forma robusta."""
    lowered = text.lower()
    decomposed = unicodedata.normalize("NFKD", lowered)
    return "".join(ch for ch in decomposed if not unicodedata.combining(ch))


def weak_label(text: str) -> dict[str, float]:
    """Aplica as heuristicas e devolve o vetor multi-label (0.0/1.0)."""
    norm = normalize(text)

    def has_any(markers: Iterable[str]) -> bool:
        return any(marker in norm for marker in markers)

    inconsistencia = has_any(INCONSIST_PROHIBITION) and has_any(INCONSIST_OVERRIDE)
    return {
        "ambiguidade": 1.0 if has_any(AMBIGUIDADE_MARKERS) else 0.0,
        "vagueza": 1.0 if has_any(VAGUEZA_MARKERS) else 0.0,
        "falta_referencia": (1.0 if has_any(FALTA_REFERENCIA_MARKERS) else 0.0),
        "inconsistencia": 1.0 if inconsistencia else 0.0,
    }


def _http_get_json(url: str, *, retries: int = 3) -> dict[str, Any]:
    """GET com Accept JSON, timeout e retry simples."""
    request = urllib.request.Request(url, headers={"Accept": "application/json"})
    last_exc: Exception | None = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError) as exc:
            last_exc = exc
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Falha ao buscar {url}: {last_exc!r}")


def fetch_proposicoes(
    years: list[int], per_page: int = 100
) -> Iterable[dict[str, Any]]:
    """Itera proposicoes do tipo PL para cada ano informado (paginado)."""
    for year in years:
        page = 1
        while True:
            params = urllib.parse.urlencode(
                {
                    "siglaTipo": "PL",
                    "ano": year,
                    "itens": per_page,
                    "pagina": page,
                    "ordem": "ASC",
                    "ordenarPor": "id",
                }
            )
            payload = _http_get_json(f"{API_BASE}/proposicoes?{params}")
            rows = payload.get("dados", [])
            if not rows:
                break
            for row in rows:
                yield row
            # Para quando a pagina retorna menos que o tamanho pedido.
            if len(rows) < per_page:
                break
            page += 1
            time.sleep(0.2)  # cortesia com a API publica


def build_record(row: dict[str, Any]) -> dict[str, Any] | None:
    """Constroi um exemplo no schema do dataset a partir de uma proposicao."""
    ementa = (row.get("ementa") or "").strip()
    ementa = " ".join(ementa.split())  # normaliza espacos em branco
    if len(ementa) < 120:  # curta demais para ser util
        return None

    numero = row.get("numero")
    ano = row.get("ano")
    law_number = f"PL {numero}/{ano}"
    return {
        "id": f"camara-pl-{row.get('id')}",
        "title": f"{law_number} (Camara dos Deputados)",
        "description": "Proposicao coletada da API de Dados Abertos da Camara.",
        "lawNumber": law_number,
        "jurisdiction": "Federal",
        "publicationDate": f"{ano}-01-01T00:00:00Z",
        "text": ementa,
        "labels": weak_label(ementa),
        "labelSource": "weak-heuristic",
    }


def load_seed() -> list[dict[str, Any]]:
    """Carrega o dataset-semente curado (rotulos GOLD) para mesclar."""
    if not SEED_DATASET.exists():
        return []
    with open(SEED_DATASET, "r", encoding="utf-8") as handle:
        seed = json.load(handle)
    for item in seed:
        item.setdefault("labelSource", "gold-manual")
    return seed


def summarize(records: list[dict[str, Any]]) -> None:
    """Imprime a distribuicao de positivos por categoria."""
    counts = {cat: 0 for cat in LABELS}
    for item in records:
        for cat in LABELS:
            counts[cat] += int(item["labels"].get(cat, 0.0))
    n = len(records)
    all_zero = sum(
        1 for item in records if not any(item["labels"].get(cat, 0.0) for cat in LABELS)
    )
    print(f"[dataset] total={n} | sem_nenhuma_tag={all_zero}")
    for cat in LABELS:
        pct = (100.0 * counts[cat] / n) if n else 0.0
        print(f"    {cat:>18}: {counts[cat]:>4} positivos ({pct:4.1f}%)")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Coleta ementas da Camara + rotulagem fraca (weak labels)."
    )
    parser.add_argument("--target", type=int, default=550)
    parser.add_argument(
        "--years",
        type=int,
        nargs="+",
        default=[2019, 2020, 2021, 2022, 2023, 2024],
    )
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument(
        "--include-seed",
        action="store_true",
        help="Mescla os exemplos GOLD de data/dataset_laws.json no resultado.",
    )
    parser.add_argument(
        "--max-zero-frac",
        type=float,
        default=0.35,
        help="Fracao maxima de exemplos sem nenhuma tag (para nao desbalancear).",
    )
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    print("--- Coleta Camara + weak labels (CrivoAI) ---")
    print(f"[api] anos={args.years} alvo>={args.target}")

    records: list[dict[str, Any]] = []
    seen_texts: set[str] = set()
    max_zero = int(args.target * args.max_zero_frac)
    zero_count = 0

    for row in fetch_proposicoes(args.years):
        record = build_record(row)
        if record is None:
            continue
        key = record["text"][:200]
        if key in seen_texts:
            continue

        is_zero = not any(record["labels"].get(cat, 0.0) for cat in LABELS)
        if is_zero and zero_count >= max_zero:
            continue  # ja temos exemplos "limpos" suficientes

        seen_texts.add(key)
        records.append(record)
        if is_zero:
            zero_count += 1

        if len(records) >= args.target:
            break

    if args.include_seed:
        seed = load_seed()
        print(f"[seed] mesclando {len(seed)} exemplos GOLD curados")
        records = seed + records

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as handle:
        json.dump(records, handle, ensure_ascii=False, indent=2)

    print(f"[ok] {len(records)} exemplos escritos em {args.out}")
    summarize(records)
    print(
        "[aviso] Rotulos FRACOS (heuristicos). Revise por humanos antes de "
        "usar as metricas como criterio de producao."
    )


if __name__ == "__main__":
    main()
