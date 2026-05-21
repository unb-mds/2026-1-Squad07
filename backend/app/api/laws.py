from fastapi import APIRouter, status

from app.db.client import db
from app.models.law import LawResponse, LawSubmissionRequest

router = APIRouter(prefix="/laws", tags=["laws"])


@router.post("", response_model=LawResponse, status_code=status.HTTP_201_CREATED)
async def submit_law(law: LawSubmissionRequest):
    """Cria uma lei submetida pelo usuario para avaliacao posterior."""
    data = law.model_dump(exclude_none=True)
    data["sourceType"] = "USER_UPLOAD"

    return await db.law.create(data=data)
