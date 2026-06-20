from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api import auth
from app.main import app
from tests.conftest import FakeUserDelegate, make_user

client = TestClient(app)


def test_register_cadastra_usuario_com_senha_hasheada(monkeypatch):
    fake_user_delegate = FakeUserDelegate()
    monkeypatch.setattr(auth, "db", SimpleNamespace(user=fake_user_delegate))
    monkeypatch.setattr(auth, "hash_password", lambda password: f"hashed-{password}")
    monkeypatch.setattr(auth, "create_access_token", lambda user: f"token-{user.id}")

    response = client.post(
        "/auth/register",
        json={
            "name": "Maria Silva",
            "email": "maria@example.com",
            "password": "senha-segura",
        },
    )

    assert response.status_code == 201
    assert fake_user_delegate.created_data == {
        "name": "Maria Silva",
        "email": "maria@example.com",
        "role": "COMMON",
        "passwordHash": "hashed-senha-segura",
    }
    assert response.json()["accessToken"] == "token-user-created"
    assert response.json()["tokenType"] == "bearer"
    assert "passwordHash" not in response.json()["user"]


def test_register_retorna_409_quando_email_ja_existe(monkeypatch):
    fake_user_delegate = FakeUserDelegate([make_user()])
    monkeypatch.setattr(auth, "db", SimpleNamespace(user=fake_user_delegate))

    response = client.post(
        "/auth/register",
        json={
            "name": "Maria Silva",
            "email": "maria@example.com",
            "password": "senha-segura",
        },
    )

    assert response.status_code == 409
    assert fake_user_delegate.created_data is None


def test_register_normaliza_email_para_minusculas(monkeypatch):
    fake_user_delegate = FakeUserDelegate()
    monkeypatch.setattr(auth, "db", SimpleNamespace(user=fake_user_delegate))
    monkeypatch.setattr(auth, "hash_password", lambda password: f"hashed-{password}")
    monkeypatch.setattr(auth, "create_access_token", lambda user: f"token-{user.id}")

    response = client.post(
        "/auth/register",
        json={
            "name": "Maria Silva",
            "email": "MARIA@EXAMPLE.COM",
            "password": "senha-segura",
        },
    )

    assert response.status_code == 201
    assert fake_user_delegate.created_data["email"] == "maria@example.com"
    assert response.json()["user"]["email"] == "maria@example.com"


def test_register_ignora_role_do_payload_publico(monkeypatch):
    fake_user_delegate = FakeUserDelegate()
    monkeypatch.setattr(auth, "db", SimpleNamespace(user=fake_user_delegate))
    monkeypatch.setattr(auth, "hash_password", lambda password: f"hashed-{password}")
    monkeypatch.setattr(auth, "create_access_token", lambda user: f"token-{user.id}")

    response = client.post(
        "/auth/register",
        json={
            "name": "Maria Silva",
            "email": "maria@example.com",
            "password": "senha-segura",
            "role": "ADMIN",
        },
    )

    assert response.status_code == 201
    assert fake_user_delegate.created_data["role"] == "COMMON"
    assert response.json()["user"]["role"] == "COMMON"


def test_login_retorna_token_quando_credenciais_sao_validas(monkeypatch):
    fake_user_delegate = FakeUserDelegate([make_user()])
    monkeypatch.setattr(auth, "db", SimpleNamespace(user=fake_user_delegate))
    monkeypatch.setattr(auth, "verify_password", lambda password, hash: True)
    monkeypatch.setattr(auth, "create_access_token", lambda user: f"token-{user.id}")

    response = client.post(
        "/auth/login",
        json={"email": "maria@example.com", "password": "senha-segura"},
    )

    assert response.status_code == 200
    assert response.json()["accessToken"] == "token-user-123"
    assert response.json()["user"]["email"] == "maria@example.com"
    assert "passwordHash" not in response.json()["user"]


def test_login_retorna_401_quando_senha_e_invalida(monkeypatch):
    fake_user_delegate = FakeUserDelegate([make_user()])
    monkeypatch.setattr(auth, "db", SimpleNamespace(user=fake_user_delegate))
    monkeypatch.setattr(auth, "verify_password", lambda password, hash: False)

    response = client.post(
        "/auth/login",
        json={"email": "maria@example.com", "password": "senha-incorreta"},
    )

    assert response.status_code == 401
