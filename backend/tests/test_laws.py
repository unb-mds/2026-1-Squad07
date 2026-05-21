from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api import laws
from app.main import app

client = TestClient(app)


class FakeLawDelegate:
    def __init__(self):
        self.created_data = None

    async def create(self, data):
        """Simula a criacao de uma lei pelo delegate do Prisma."""
        self.created_data = data
        now = datetime(2026, 5, 20, 12, 0, tzinfo=timezone.utc)

        return SimpleNamespace(
            id="law-123",
            createdAt=now,
            updatedAt=now,
            description=None,
            sourceUrl=None,
            jurisdiction=None,
            lawNumber=None,
            publicationDate=None,
            uploadedByUserId=None,
            **data,
        )


def test_submit_law_cria_lei_como_user_upload(monkeypatch):
    """Verifica que a submissao salva a lei como upload do usuario."""
    fake_law_delegate = FakeLawDelegate()
    monkeypatch.setattr(laws, "db", SimpleNamespace(law=fake_law_delegate))

    response = client.post(
        "/laws",
        json={
            "title": "Projeto de Lei sobre transparencia",
            "text": "Art. 1 Esta lei estabelece regras de transparencia publica.",
        },
    )

    assert response.status_code == 201
    assert fake_law_delegate.created_data == {
        "title": "Projeto de Lei sobre transparencia",
        "text": "Art. 1 Esta lei estabelece regras de transparencia publica.",
        "isPublic": False,
        "sourceType": "USER_UPLOAD",
    }
    assert response.json()["id"] == "law-123"
    assert response.json()["sourceType"] == "USER_UPLOAD"


def test_submit_law_exige_titulo_e_texto():
    """Verifica que titulo e texto vazios retornam erro de validacao."""
    response = client.post("/laws", json={"title": "", "text": ""})

    assert response.status_code == 422
