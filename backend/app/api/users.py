from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.dependencies import get_current_user, require_admin_user
from app.db.client import db
from app.models.user import UserCreateRequest, UserResponse, UserUpdateRequest
from app.services.security import hash_password

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


def ensure_profile_access(current_user, user_id: str) -> None:
    if current_user.id != user_id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas o proprio usuario ou administradores podem acessar este perfil.",
        )


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin_user)],
)
async def create_user(user: UserCreateRequest):
    """Cria um usuario com senha hasheada."""
    existing_user = await db.user.find_unique(where={"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um usuario com este e-mail.",
        )

    data = user.model_dump(exclude={"password"})
    data["passwordHash"] = hash_password(user.password)

    return await db.user.create(data=data)


@router.get(
    "",
    response_model=list[UserResponse],
    dependencies=[Depends(require_admin_user)],
)
async def list_users():
    """Lista todos os usuarios."""
    return await db.user.find_many()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user=Depends(get_current_user)):
    """Busca um usuario pelo id."""
    ensure_profile_access(current_user, user_id)

    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario nao encontrado.",
        )

    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user: UserUpdateRequest,
    current_user=Depends(get_current_user),
):
    """Atualiza parcialmente um usuario."""
    ensure_profile_access(current_user, user_id)

    existing_user = await db.user.find_unique(where={"id": user_id})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario nao encontrado.",
        )

    data = user.model_dump(exclude_unset=True)
    if not data:
        return existing_user

    if "role" in data and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem alterar a role de um usuario.",
        )

    if "email" in data:
        user_with_email = await db.user.find_unique(where={"email": data["email"]})
        if user_with_email and user_with_email.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ja existe um usuario com este e-mail.",
            )

    if "password" in data:
        data["passwordHash"] = hash_password(data.pop("password"))

    return await db.user.update(where={"id": user_id}, data=data)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin_user)],
)
async def delete_user(user_id: str):
    """Remove um usuario pelo id."""
    existing_user = await db.user.find_unique(where={"id": user_id})
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario nao encontrado.",
        )

    await db.user.delete(where={"id": user_id})
    return Response(status_code=status.HTTP_204_NO_CONTENT)
