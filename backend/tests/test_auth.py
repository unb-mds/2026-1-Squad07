from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api import auth
from app.main import app

client = TestClient(app)


def make_user(
    user_id="user-123",
    name="Maria Silva",
    email="maria@example.com",
    password_hash="hashed-senha-segura",
    role="COMMON",
):
    now = datetime(2026, 5, 20, 12, 0, tzinfo=timezone.utc)

    return SimpleNamespace(
        id=user_id,
        name=name,
        email=email,
        passwordHash=password_hash,
        role=role,
        createdAt=now,
        updatedAt=now,
    )


class FakeUserDelegate:
    def __init__(self, initial_users=None):
        self.users_by_id = {}
        self.created_data = None

        for user in initial_users or []:
            self.users_by_id[user.id] = user

    async def create(self, data):
        self.created_data = data
        created_user = make_user(
            user_id="user-created",
            name=data["name"],
            email=data["email"],
            password_hash=data["passwordHash"],
            role=data["role"],
        )
        self.users_by_id[created_user.id] = created_user

        return created_user

    async def find_unique(self, where):
        if "email" in where:
            return next(
                (
                    user
                    for user in self.users_by_id.values()
                    if user.email == where["email"]
                ),
                None,
            )

        return None


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
