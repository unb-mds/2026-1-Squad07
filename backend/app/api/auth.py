from fastapi import APIRouter, HTTPException, status

from app.db.client import db
from app.models.user import AuthResponse, UserCreateRequest, UserLoginRequest
from app.services.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(user: UserCreateRequest):
    """Cadastra um usuario e retorna um token de acesso."""
    existing_user = await db.user.find_unique(where={"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um usuario com este e-mail.",
        )

    data = user.model_dump(exclude={"password"})
    data["passwordHash"] = hash_password(user.password)
    created_user = await db.user.create(data=data)

    return {
        "accessToken": create_access_token(created_user),
        "user": created_user,
    }


@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLoginRequest):
    """Autentica um usuario com e-mail e senha."""
    user = await db.user.find_unique(where={"email": credentials.email})
    if not user or not verify_password(credentials.password, user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha invalidos.",
        )

    return {
        "accessToken": create_access_token(user),
        "user": user,
    }
