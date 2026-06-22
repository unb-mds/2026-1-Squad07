from datetime import datetime, timezone
from types import SimpleNamespace


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
