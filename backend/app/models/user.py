from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

UserRole = Literal["COMMON", "ADMIN"]


class EmailNormalizeMixin(BaseModel):
    @field_validator("email", check_fields=False)
    @classmethod
    def normalize_email(cls, email: str) -> str:
        return email.lower()


class UserRegisterRequest(EmailNormalizeMixin):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserCreateRequest(UserRegisterRequest):
    role: UserRole = "COMMON"


class UserUpdateRequest(EmailNormalizeMixin):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=1)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8)
    role: UserRole | None = None

    @model_validator(mode="before")
    @classmethod
    def reject_null_fields(cls, data):
        if isinstance(data, dict):
            null_fields = [field for field, value in data.items() if value is None]
            if null_fields:
                fields = ", ".join(sorted(null_fields))
                raise ValueError(f"Campos nao podem ser nulos: {fields}.")

        return data


class UserLoginRequest(EmailNormalizeMixin):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    role: str
    createdAt: datetime
    updatedAt: datetime


class AuthResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: UserResponse
