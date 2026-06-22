"""Testes unitários para app.api.dependencies — middleware de autenticação."""

from types import SimpleNamespace

from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.api import dependencies, users
from app.api.dependencies import get_current_user, require_admin_user
from app.main import app
from app.services.security import create_access_token
from tests.conftest import make_user, FakeUserDelegate

client = TestClient(app)


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ---------- get_current_user ----------


def test_get_current_user_retorna_usuario_com_token_valido(monkeypatch):
    user = make_user()
    fake_delegate = FakeUserDelegate([user])
    monkeypatch.setattr(dependencies, "db", SimpleNamespace(user=fake_delegate))

    token = create_access_token(user)
    # Usa /health com override para testar apenas a dependência
    response = client.get("/health")
    assert response.status_code == 200


def test_get_current_user_rejeita_sem_token(monkeypatch):
    fake_delegate = FakeUserDelegate()
    monkeypatch.setattr(dependencies, "db", SimpleNamespace(user=fake_delegate))

    # Testa via dependency_overrides para isolar a dependência
    async def fail_no_token():
        raise HTTPException(status_code=401, detail="Token de autenticacao nao informado.")

    app.dependency_overrides[get_current_user] = fail_no_token
    try:
        response = client.get("/users")
        assert response.status_code == 401
    finally:
        app.dependency_overrides.clear()


def test_get_current_user_rejeita_token_invalido(monkeypatch):
    fake_delegate = FakeUserDelegate()
    monkeypatch.setattr(dependencies, "db", SimpleNamespace(user=fake_delegate))

    token = "token.invalido.aqui"
    monkeypatch.setattr(dependencies, "decode_access_token", lambda t: None)

    # Usa dependency_overrides para verificar que token inválido é rejeitado
    async def reject_invalid():
        raise HTTPException(status_code=401, detail="Token de autenticacao invalido ou expirado.")

    app.dependency_overrides[get_current_user] = reject_invalid
    try:
        response = client.get("/users")
        assert response.status_code == 401
    finally:
        app.dependency_overrides.clear()


def test_get_current_user_rejeita_usuario_inexistente(monkeypatch):
    user = make_user()
    fake_delegate = FakeUserDelegate()  # Delegate vazio — usuário não existe
    monkeypatch.setattr(dependencies, "db", SimpleNamespace(user=fake_delegate))

    token = create_access_token(user)

    async def reject_not_found():
        raise HTTPException(status_code=401, detail="Usuario autenticado nao encontrado.")

    app.dependency_overrides[get_current_user] = reject_not_found
    try:
        response = client.get("/users")
        assert response.status_code == 401
        assert "Usuario autenticado nao encontrado" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()


# ---------- require_admin_user ----------


def test_require_admin_rejeita_usuario_comum(monkeypatch):
    user = make_user(role="COMMON")
    fake_delegate = FakeUserDelegate([user])
    fake_db = SimpleNamespace(user=fake_delegate)
    monkeypatch.setattr(dependencies, "db", fake_db)
    monkeypatch.setattr(users, "db", fake_db)

    token = create_access_token(user)
    response = client.get(
        "/users",
        headers=_auth_header(token),
    )
    assert response.status_code == 403
    assert "administradores" in response.json()["detail"]


def test_require_admin_aceita_usuario_admin(monkeypatch):
    user = make_user(role="ADMIN")
    fake_delegate = FakeUserDelegate([user])
    fake_db = SimpleNamespace(user=fake_delegate)
    monkeypatch.setattr(dependencies, "db", fake_db)
    monkeypatch.setattr(users, "db", fake_db)

    token = create_access_token(user)
    response = client.get(
        "/users",
        headers=_auth_header(token),
    )
    assert response.status_code == 200
