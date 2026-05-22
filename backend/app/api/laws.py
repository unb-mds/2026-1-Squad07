from fastapi import APIRouter, status

from app.db.client import db
from app.models.law import LawListItem, LawResponse, LawSubmissionRequest

router = APIRouter(prefix="/laws", tags=["laws"])

TEXT_EXCERPT_MAX_LENGTH = 120


@router.post("", response_model=LawResponse, status_code=status.HTTP_201_CREATED)
async def submit_law(law: LawSubmissionRequest):
    """Cria uma lei submetida pelo usuario para avaliacao posterior."""
    data = law.model_dump(exclude_none=True)
    data["sourceType"] = "USER_UPLOAD"

    return await db.law.create(data=data)


@router.get("", response_model=list[LawListItem])
async def list_law_submissions():
    """Lista submissoes legislativas enviadas por usuarios."""
    laws = await db.law.find_many(
        where={"sourceType": "USER_UPLOAD"},
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
