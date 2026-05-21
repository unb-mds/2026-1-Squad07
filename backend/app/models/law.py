from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LawSubmissionRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=1)
    description: str | None = None
    text: str = Field(..., min_length=1)
    sourceUrl: str | None = None
    jurisdiction: str | None = None
    lawNumber: str | None = None
    publicationDate: datetime | None = None
    uploadedByUserId: str | None = None
    isPublic: bool = False
    

class LawResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str | None
    text: str
    sourceType: str
    sourceUrl: str | None
    jurisdiction: str | None
    lawNumber: str | None
    publicationDate: datetime | None
    uploadedByUserId: str | None
    isPublic: bool
    createdAt: datetime
    updatedAt: datetime
