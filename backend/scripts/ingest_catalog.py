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
from app.services.analysis_provider import LegalBERTProvider  # noqa: E402
from app.services.summary_provider import (  # noqa: E402
    MockSummaryProvider,
    GeminiSummaryProvider,
)

DATASET_PATH = Path(__file__).resolve().parent.parent / "data" / "dataset_laws.json"


async def ingest_catalog():
    print("--- Iniciando Ingestão de Leis do Catálogo ---")
    if not DATASET_PATH.exists():
        print(f"Erro: Dataset não encontrado em {DATASET_PATH}")
        return

    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        laws_data = json.load(f)

    # Inicializar componentes para avaliação
    provider = LegalBERTProvider()
    cache = AnalysisCache()

    # Inicializar o summary provider apropriado
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        summary_provider = GeminiSummaryProvider(gemini_key)
    else:
        summary_provider = MockSummaryProvider()

    created_laws = 0
    updated_laws = 0
    created_analyses = 0

    for item in laws_data:
        # Formatar a data de publicação
        pub_date = None
        if "publicationDate" in item and item["publicationDate"]:
            try:
                date_str = item["publicationDate"].replace("Z", "+00:00")
                pub_date = datetime.fromisoformat(date_str)
            except ValueError:
                pub_date = datetime.now(timezone.utc)

        law_payload = {
            "title": item["title"],
            "description": item["description"],
            "text": item["text"],
            "lawNumber": item["lawNumber"],
            "jurisdiction": item["jurisdiction"],
            "publicationDate": pub_date,
            "sourceType": "CATALOG",
            "isPublic": True,
        }

        # Verificar se a lei já existe
        existing = await db.law.find_unique(where={"id": item["id"]})

        if existing is None:
            await db.law.create(data={"id": item["id"], **law_payload})
            print(f"Lei criada: {item['title']} (CATALOG)")
            created_laws += 1
        else:
            await db.law.update(where={"id": item["id"]}, data=law_payload)
            print(f"Lei atualizada: {item['title']} (CATALOG)")
            updated_laws += 1

        # Executar a avaliação online e persistir em Analysis
        # O evaluate_text grava o registro de Analysis automaticamente associado ao lawId
        try:
            print(f"  Calculando análise real para {item['id']}...")
            analysis_result = await evaluate_text(
                item["text"],
                item["id"],
                provider=provider,
                summary_provider=summary_provider,
                cache=cache,
                db=db,
            )
            print(
                f"  Análise persistida. Score calculado: {analysis_result['score']:.2f}"
            )
            created_analyses += 1
        except Exception as e:
            print(f"  Erro ao calcular/persistir análise de {item['id']}: {e}")

    print("\n--- Ingestão concluída com sucesso! ---")
    print(f"Leis Criadas: {created_laws}")
    print(f"Leis Atualizadas: {updated_laws}")
    print(f"Análises Persistidas: {created_analyses}")


async def main():
    await db.connect()
    try:
        await ingest_catalog()
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
