from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import analysis, auth, health, laws, users
from app.db.client import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()


app = FastAPI(lifespan=lifespan)

# Rotas que o backend vai aceitar requisições
origins = [
    "http://localhost:3000",
    "http://localhost:8080",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # A API vai aceitar solicitações de todas URL's que estiverem na lista
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(laws.router)
app.include_router(users.router)
app.include_router(analysis.router)
