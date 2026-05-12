from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health

app = FastAPI()

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
