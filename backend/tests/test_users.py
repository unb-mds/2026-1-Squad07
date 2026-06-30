from datetime import datetime, timezone
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.api import users
from app.main import app

client = TestClient(app)


def make_user(
    user_id="user-123",
    name="Maria Silva",
    email="maria@example.com",
    password_hash="hash-seguro",
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
        self.updated_where = None
        self.updated_data = None
        self.deleted_where = None

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
        if "id" in where:
            return self.users_by_id.get(where["id"])

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

    async def find_many(self):
        return list(self.users_by_id.values())

    async def update(self, where, data):
        self.updated_where = where
        self.updated_data = data
        current_user = self.users_by_id[where["id"]]

        updated_user = make_user(
            user_id=current_user.id,
            name=data.get("name", current_user.name),
            email=data.get("email", current_user.email),
            password_hash=data.get("passwordHash", current_user.passwordHash),
            role=data.get("role", current_user.role),
        )
        self.users_by_id[updated_user.id] = updated_user

        return updated_user

    async def delete(self, where):
        self.deleted_where = where
        return self.users_by_id.pop(where["id"])


@pytest.fixture(autouse=True)
def admin_dependency_override():
    app.dependency_overrides[users.require_admin_user] = lambda: make_user(role="ADMIN")
    app.dependency_overrides[users.get_current_user] = lambda: make_user(role="ADMIN")
    yield
    app.dependency_overrides.pop(users.require_admin_user, None)
    app.dependency_overrides.pop(users.get_current_user, None)


def test_list_users_rejeita_requisicao_sem_token():
    app.dependency_overrides.pop(users.require_admin_user, None)

    response = client.get("/users")

    assert response.status_code == 401


def test_list_users_rejeita_usuario_sem_role_admin():
    app.dependency_overrides[users.require_admin_user] = lambda: (_ for _ in ()).throw(
        users.HTTPException(status_code=403, detail="Apenas administradores.")
    )

    response = client.get("/users")

    assert response.status_code == 403


def test_create_user_cria_usuario_e_nao_retorna_password_hash(monkeypatch):
    fake_user_delegate = FakeUserDelegate()
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))
    monkeypatch.setattr(users, "hash_password", lambda password: f"hashed-{password}")

    response = client.post(
        "/users",
        json={
            "name": "Maria Silva",
            "email": "maria@example.com",
            "password": "senha-segura",
            "role": "ADMIN",
        },
    )

    assert response.status_code == 201
    assert fake_user_delegate.created_data == {
        "name": "Maria Silva",
        "email": "maria@example.com",
        "passwordHash": "hashed-senha-segura",
        "role": "ADMIN",
    }
    assert response.json()["id"] == "user-created"
    assert "passwordHash" not in response.json()


def test_create_user_retorna_409_quando_email_ja_existe(monkeypatch):
    existing_user = make_user(email="maria@example.com")
    fake_user_delegate = FakeUserDelegate([existing_user])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))

    response = client.post(
        "/users",
        json={
            "name": "Maria Silva",
            "email": "maria@example.com",
            "password": "senha-segura",
        },
    )

    assert response.status_code == 409
    assert fake_user_delegate.created_data is None


def test_create_user_normaliza_email_para_minusculas(monkeypatch):
    fake_user_delegate = FakeUserDelegate()
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))
    monkeypatch.setattr(users, "hash_password", lambda password: f"hashed-{password}")

    response = client.post(
        "/users",
        json={
            "name": "Maria Silva",
            "email": "MARIA@EXAMPLE.COM",
            "password": "senha-segura",
        },
    )

    assert response.status_code == 201
    assert fake_user_delegate.created_data["email"] == "maria@example.com"
    assert response.json()["email"] == "maria@example.com"


def test_list_users_retorna_usuarios_sem_password_hash(monkeypatch):
    fake_user_delegate = FakeUserDelegate([make_user()])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))

    response = client.get("/users")

    assert response.status_code == 200
    assert response.json()[0]["email"] == "maria@example.com"
    assert "passwordHash" not in response.json()[0]


def test_get_user_retorna_404_quando_nao_encontra(monkeypatch):
    fake_user_delegate = FakeUserDelegate()
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))

    response = client.get("/users/user-inexistente")

    assert response.status_code == 404


def test_get_user_permite_usuario_comum_consultar_proprio_perfil(monkeypatch):
    common_user = make_user(role="COMMON")
    fake_user_delegate = FakeUserDelegate([common_user])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))
    app.dependency_overrides[users.get_current_user] = lambda: common_user

    response = client.get("/users/user-123")

    assert response.status_code == 200
    assert response.json()["id"] == "user-123"


def test_get_user_rejeita_usuario_comum_consultando_outro_perfil(monkeypatch):
    common_user = make_user(user_id="user-123", role="COMMON")
    other_user = make_user(user_id="user-456", email="ana@example.com")
    fake_user_delegate = FakeUserDelegate([common_user, other_user])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))
    app.dependency_overrides[users.get_current_user] = lambda: common_user

    response = client.get("/users/user-456")

    assert response.status_code == 403


def test_update_user_atualiza_somente_campos_enviados(monkeypatch):
    fake_user_delegate = FakeUserDelegate([make_user()])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))

    response = client.patch("/users/user-123", json={"name": "Maria Souza"})

    assert response.status_code == 200
    assert fake_user_delegate.updated_where == {"id": "user-123"}
    assert fake_user_delegate.updated_data == {"name": "Maria Souza"}
    assert response.json()["name"] == "Maria Souza"


def test_update_user_hasheia_senha_antes_de_atualizar(monkeypatch):
    fake_user_delegate = FakeUserDelegate([make_user()])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))
    monkeypatch.setattr(users, "hash_password", lambda password: f"hashed-{password}")

    response = client.patch("/users/user-123", json={"password": "nova-senha"})

    assert response.status_code == 200
    assert fake_user_delegate.updated_data == {"passwordHash": "hashed-nova-senha"}


def test_update_user_retorna_409_quando_email_pertence_a_outro_usuario(monkeypatch):
    current_user = make_user(user_id="user-123", email="maria@example.com")
    another_user = make_user(user_id="user-456", email="ana@example.com")
    fake_user_delegate = FakeUserDelegate([current_user, another_user])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))

    response = client.patch("/users/user-123", json={"email": "ana@example.com"})

    assert response.status_code == 409
    assert fake_user_delegate.updated_data is None


def test_update_user_normaliza_email_para_minusculas(monkeypatch):
    fake_user_delegate = FakeUserDelegate([make_user()])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))

    response = client.patch("/users/user-123", json={"email": "MARIA@EXAMPLE.COM"})

    assert response.status_code == 200
    assert fake_user_delegate.updated_data == {"email": "maria@example.com"}
    assert response.json()["email"] == "maria@example.com"


def test_update_user_rejeita_campos_nulos(monkeypatch):
    fake_user_delegate = FakeUserDelegate([make_user()])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))

    response = client.patch("/users/user-123", json={"password": None})

    assert response.status_code == 422
    assert fake_user_delegate.updated_data is None


def test_update_user_permite_usuario_comum_atualizar_proprio_perfil(monkeypatch):
    common_user = make_user(role="COMMON")
    fake_user_delegate = FakeUserDelegate([common_user])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))
    app.dependency_overrides[users.get_current_user] = lambda: common_user

    response = client.patch("/users/user-123", json={"name": "Maria Souza"})

    assert response.status_code == 200
    assert fake_user_delegate.updated_data == {"name": "Maria Souza"}


def test_update_user_rejeita_usuario_comum_atualizando_outro_perfil(monkeypatch):
    common_user = make_user(user_id="user-123", role="COMMON")
    other_user = make_user(user_id="user-456", email="ana@example.com")
    fake_user_delegate = FakeUserDelegate([common_user, other_user])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))
    app.dependency_overrides[users.get_current_user] = lambda: common_user

    response = client.patch("/users/user-456", json={"name": "Ana Souza"})

    assert response.status_code == 403
    assert fake_user_delegate.updated_data is None


def test_delete_user_remove_usuario(monkeypatch):
    fake_user_delegate = FakeUserDelegate([make_user()])
    monkeypatch.setattr(users, "db", SimpleNamespace(user=fake_user_delegate))

    response = client.delete("/users/user-123")

    assert response.status_code == 204
    assert fake_user_delegate.deleted_where == {"id": "user-123"}
