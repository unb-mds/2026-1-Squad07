import asyncio
from types import SimpleNamespace

from scripts import seed_demo_laws


class FakeLawDelegate:
    def __init__(self):
        self.persisted_ids = set()
        self.created = []
        self.updated = []

    async def find_unique(self, where):
        if where["id"] in self.persisted_ids:
            return SimpleNamespace(id=where["id"])
        return None

    async def create(self, data):
        self.created.append(data)
        self.persisted_ids.add(data["id"])

    async def update(self, where, data):
        self.updated.append((where, data))


def test_seed_demo_laws_e_idempotente(monkeypatch):
    fake_law_delegate = FakeLawDelegate()
    fake_db = SimpleNamespace(law=fake_law_delegate)
    monkeypatch.setattr(seed_demo_laws, "db", fake_db)

    asyncio.run(seed_demo_laws.persist_demo_laws())
    asyncio.run(seed_demo_laws.persist_demo_laws())

    assert len(fake_law_delegate.created) == len(seed_demo_laws.DEMO_LAWS)
    assert len(fake_law_delegate.updated) == len(seed_demo_laws.DEMO_LAWS)
    assert all(
        data["title"].startswith("[Demonstração]") for data in fake_law_delegate.created
    )
