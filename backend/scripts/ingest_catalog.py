"""Ingere leis de um dataset JSON no banco de dados como catálogo (CATALOG).

Uso básico (leis sintéticas originais):
    python scripts/ingest_catalog.py

Ingerir leis reais da Câmara sem análise (rápido, sem consumir Gemini):
    python scripts/ingest_catalog.py \\
        --dataset data/dataset_laws_camara.json \\
        --only-real \\
        --limit 50 \\
        --skip-analysis

Ingerir leis reais da Câmara com análise e resumo Gemini:
    python scripts/ingest_catalog.py \\
        --dataset data/dataset_laws_camara.json \\
        --only-real \\
        --limit 20
"""

import argparse
import asyncio
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Garantir que o diretório raiz do backend esteja no path para importações
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.client import db  # noqa: E402
from app.services.analysis.cache import AnalysisCache  # noqa: E402
from app.services.analysis.service import evaluate_text  # noqa: E402
from app.services.analysis_provider import TfidfProvider  # noqa: E402
from app.services.summary_provider import (  # noqa: E402
    GeminiSummaryProvider,
    MockSummaryProvider,
)

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATASET = BACKEND_DIR / "data" / "dataset_laws.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Ingere leis no catálogo do banco.")
    parser.add_argument(
        "--dataset",
        type=Path,
        default=DEFAULT_DATASET,
        help="Caminho para o arquivo JSON do dataset (padrão: data/dataset_laws.json)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Número máximo de leis a ingerir (padrão: todas)",
    )
    parser.add_argument(
        "--only-real",
        action="store_true",
        help="Filtra apenas leis reais (labelSource != 'gold-manual'), "
        "ignorando os exemplos sintéticos do seed.",
    )
    parser.add_argument(
        "--skip-analysis",
        action="store_true",
        help="Pula a etapa de análise/resumo (mais rápido, sem consumir quota do Gemini).",
    )
    return parser.parse_args()


async def ingest_catalog(args: argparse.Namespace) -> None:
    dataset_path: Path = args.dataset
    limit: int | None = args.limit
    only_real: bool = args.only_real
    skip_analysis: bool = args.skip_analysis

    print(f"--- Iniciando Ingestão de Leis do Catálogo ---")
    print(f"Dataset : {dataset_path}")
    print(f"Limite  : {limit or 'sem limite'}")
    print(f"Apenas reais: {only_real}")
    print(f"Pular análise: {skip_analysis}")
    print()

    if not dataset_path.exists():
        print(f"Erro: Dataset não encontrado em {dataset_path}")
        return

    with open(dataset_path, "r", encoding="utf-8") as f:
        laws_data: list[dict] = json.load(f)

    # Filtrar apenas leis reais (da Câmara), ignorando os seed sintéticos
    if only_real:
        laws_data = [
            item
            for item in laws_data
            if item.get("labelSource", "gold-manual") != "gold-manual"
        ]
        print(f"{len(laws_data)} leis reais encontradas no dataset.")

    # Aplicar limite
    if limit is not None:
        laws_data = laws_data[:limit]
        print(f"Limitando a {limit} leis.")

    print()

    # Inicializar provider de classificação (TF-IDF, mais leve que LegalBERT)
    provider = TfidfProvider()
    cache = AnalysisCache()

    # Inicializar o summary provider apropriado
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        summary_provider = GeminiSummaryProvider(gemini_key)
        print("Usando GeminiSummaryProvider para resumos.")
    else:
        summary_provider = MockSummaryProvider()
        print("GEMINI_API_KEY não encontrada — usando MockSummaryProvider.")

    print()

    created_laws = 0
    updated_laws = 0
    created_analyses = 0
    errors = 0

    for i, item in enumerate(laws_data, start=1):
        # Formatar a data de publicação
        pub_date = None
        if item.get("publicationDate"):
            try:
                date_str = item["publicationDate"].replace("Z", "+00:00")
                pub_date = datetime.fromisoformat(date_str)
            except ValueError:
                pub_date = datetime.now(timezone.utc)

        law_payload = {
            "title": item["title"],
            "description": item.get("description", ""),
            "text": item["text"],
            "lawNumber": item["lawNumber"],
            "jurisdiction": item.get("jurisdiction", "Federal"),
            "publicationDate": pub_date,
            "sourceType": "CATALOG",
            "isPublic": True,
        }

        # Verificar se a lei já existe pelo ID
        existing = await db.law.find_unique(where={"id": item["id"]})

        if existing is None:
            await db.law.create(data={"id": item["id"], **law_payload})
            print(f"[{i}/{len(laws_data)}] ✓ Criada : {item['title'][:70]}")
            created_laws += 1
        else:
            await db.law.update(where={"id": item["id"]}, data=law_payload)
            print(f"[{i}/{len(laws_data)}] ~ Atualizada: {item['title'][:70]}")
            updated_laws += 1

        if skip_analysis:
            continue

        # Executar análise e resumo e persistir em Analysis
        try:
            analysis_result = await evaluate_text(
                item["text"],
                item["id"],
                provider=provider,
                summary_provider=summary_provider,
                cache=cache,
                db=db,
            )
            print(
                f"           Score: {analysis_result['score']:.2f} | "
                f"Resumo: {'✓' if analysis_result.get('summary') else '✗'}"
            )
            created_analyses += 1
        except Exception as e:
            print(f"           Erro na análise: {e}")
            errors += 1

    print()
    print("--- Ingestão concluída! ---")
    print(f"  Leis criadas    : {created_laws}")
    print(f"  Leis atualizadas: {updated_laws}")
    print(f"  Análises criadas: {created_analyses}")
    if errors:
        print(f"  Erros de análise: {errors}")


async def main() -> None:
    args = parse_args()
    await db.connect()
    try:
        await ingest_catalog(args)
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
