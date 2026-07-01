from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api import laws
from app.main import app

client = TestClient(app)


class FakeLawDelegate:
    def __init__(self):
        self.created_data = None
        self.find_many_args = None
        self.find_unique_args = None

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

    async def find_many(self, **kwargs):
        """Simula a listagem de leis persistidas no banco."""
        self.find_many_args = kwargs
        return [
            SimpleNamespace(
                id="law-2",
                title="Projeto de Lei sobre transparencia",
                text="A" * 121,
                createdAt=datetime(2026, 5, 21, 10, 0, tzinfo=timezone.utc),
            ),
            SimpleNamespace(
                id="law-1",
                title="Submissao antiga",
                text="Texto menor para exibicao direta.",
                createdAt=datetime(2026, 5, 20, 10, 0, tzinfo=timezone.utc),
            ),
        ]

    async def find_unique(self, where):
        """Simula a consulta detalhada de uma lei persistida."""
        self.find_unique_args = where
        if where["id"] == "law-inexistente":
            return None

        return SimpleNamespace(
            id=where["id"],
            title="Projeto de Lei sobre transparencia",
            text="Art. 1 Esta lei promove transparencia.",
            createdAt=datetime(2026, 5, 21, 10, 0, tzinfo=timezone.utc),
            updatedAt=datetime(2026, 5, 21, 10, 0, tzinfo=timezone.utc),
            description=None,
            sourceType="USER_UPLOAD",
            sourceUrl=None,
            jurisdiction=None,
            lawNumber="PL 123/2026",
            publicationDate=None,
            uploadedByUserId=None,
            isPublic=False,
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


def test_list_law_submissions_retorna_resumo_das_submissoes(monkeypatch):
    """Verifica que a listagem consulta o banco e retorna campos da R1."""
    fake_law_delegate = FakeLawDelegate()
    monkeypatch.setattr(laws, "db", SimpleNamespace(law=fake_law_delegate))

    response = client.get("/laws")

    assert response.status_code == 200
    assert fake_law_delegate.find_many_args == {
        "where": {"sourceType": "USER_UPLOAD"},
        "order": {"createdAt": "desc"},
    }
    assert response.json() == [
        {
            "id": "law-2",
            "title": "Projeto de Lei sobre transparencia",
            "createdAt": "2026-05-21T10:00:00Z",
            "textExcerpt": "A" * 120,
        },
        {
            "id": "law-1",
            "title": "Submissao antiga",
            "createdAt": "2026-05-20T10:00:00Z",
            "textExcerpt": "Texto menor para exibicao direta.",
        },
    ]


def test_get_law_retorna_detalhe_persistido(monkeypatch):
    """Verifica que um detalhe de lei e consultado por identificador."""
    fake_law_delegate = FakeLawDelegate()
    monkeypatch.setattr(laws, "db", SimpleNamespace(law=fake_law_delegate))

    response = client.get("/laws/law-123")

    assert response.status_code == 200
    assert fake_law_delegate.find_unique_args == {"id": "law-123"}
    assert response.json()["id"] == "law-123"
    assert response.json()["text"] == "Art. 1 Esta lei promove transparencia."
    assert response.json()["summary"] is None
    assert response.json()["lawNumber"] == "PL 123/2026"


def test_get_law_retorna_404_quando_nao_encontra(monkeypatch):
    """Verifica que identificador inexistente nao retorna dado artificial."""
    fake_law_delegate = FakeLawDelegate()
    monkeypatch.setattr(laws, "db", SimpleNamespace(law=fake_law_delegate))

    response = client.get("/laws/law-inexistente")

    assert response.status_code == 404
