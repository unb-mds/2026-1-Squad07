from fastapi import APIRouter, HTTPException, status

from app.db.client import db
from app.models.law import (
    LawListItem,
    LawResponse,
    LawSubmissionRequest,
    ReadabilityRequest,
    ReadabilityResponse,
)
from app.services.readability import calcular_score

router = APIRouter(prefix="/laws", tags=["laws"])
router_v1 = APIRouter(prefix="/api/v1/laws", tags=["laws-v1"])

TEXT_EXCERPT_MAX_LENGTH = 120


@router.post("", response_model=LawResponse, status_code=status.HTTP_201_CREATED)
async def submit_law(law: LawSubmissionRequest):
    """Cria uma lei submetida pelo usuario para avaliacao posterior."""
    data = law.model_dump(exclude_none=True)
    data["sourceType"] = "USER_UPLOAD"

    return await db.law.create(data=data)


@router.get("", response_model=list[LawListItem])
async def list_law_submissions(source_type: str = "USER_UPLOAD"):
    """Lista submissoes legislativas enviadas por usuarios ou do catalogo."""
    if source_type not in ["USER_UPLOAD", "CATALOG"]:
        source_type = "USER_UPLOAD"

    laws = await db.law.find_many(
        where={"sourceType": source_type},
        order={"createdAt": "desc"},
    )

    return [
        LawListItem(
            id=law.id,
            title=law.title,
            createdAt=law.createdAt,
            textExcerpt=law.text[:TEXT_EXCERPT_MAX_LENGTH],
        )
        for law in laws
    ]


@router.get("/{law_id}", response_model=LawResponse)
async def get_law(law_id: str):
    """Retorna o texto e os metadados persistidos de uma lei."""
    law = await db.law.find_unique(where={"id": law_id})
    if law is None:
        raise HTTPException(status_code=404, detail="Submissão não encontrada.")

    # Busca a análise mais recente para obter o resumo gerado pela IA, caso exista
    analysis = None
    if hasattr(db, "analysis"):
        analysis = await db.analysis.find_first(
            where={"lawId": law_id},
            order={"createdAt": "desc"},
        )

    law_response = LawResponse.model_validate(law)
    law_response.summary = analysis.summary if analysis else None
    return law_response


@router_v1.post(
    "/readability",
    response_model=ReadabilityResponse,
    status_code=status.HTTP_200_OK,
)
async def analyze_readability(payload: ReadabilityRequest):
    """Calcula o score de legibilidade técnica do texto legal."""
    try:
        return calcular_score(payload.texto)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao processar legibilidade: {str(e)}",
        )
