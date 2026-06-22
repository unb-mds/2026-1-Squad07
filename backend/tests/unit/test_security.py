"""Testes unitários para app.services.security — hash, token JWT e helpers."""

import time

from app.services.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    _base64url_encode,
    _base64url_encode_json,
    _base64url_decode,
)
from tests.conftest import make_user


# ---------- hash_password / verify_password ----------


def test_hash_password_retorna_string_diferente_da_senha():
    senha = "minha-senha-segura"
    hashed = hash_password(senha)
    assert isinstance(hashed, str)
    assert hashed != senha


def test_hash_password_gera_hashes_diferentes_para_mesma_senha():
    senha = "mesma-senha"
    hash1 = hash_password(senha)
    hash2 = hash_password(senha)
    assert hash1 != hash2
    assert verify_password(senha, hash1) is True
    assert verify_password(senha, hash2) is True


def test_verify_password_retorna_true_para_senha_correta():
    senha = "minha-senha-segura"
    hashed = hash_password(senha)
    assert verify_password(senha, hashed) is True


def test_verify_password_retorna_false_para_senha_incorreta():
    hashed = hash_password("senha-correta")
    assert verify_password("senha-errada", hashed) is False


def test_verify_password_retorna_false_para_hash_invalido():
    assert verify_password("qualquer", "hash-invalido") is False


# ---------- create_access_token / decode_access_token ----------


def test_create_access_token_retorna_jwt_com_tres_segmentos():
    user = make_user()
    token = create_access_token(user)
    partes = token.split(".")
    assert len(partes) == 3


def test_create_access_token_gera_tokens_diferentes_por_usuario():
    user_a = make_user(user_id="user-a", email="a@test.com")
    user_b = make_user(user_id="user-b", email="b@test.com")
    token_a = create_access_token(user_a)
    token_b = create_access_token(user_b)
    assert token_a != token_b


def test_decode_access_token_retorna_payload_valido():
    user = make_user()
    token = create_access_token(user)
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == user.id
    assert payload["email"] == user.email
    assert payload["role"] == user.role


def test_decode_access_token_retorna_none_para_token_invalido():
    assert decode_access_token("token.invalido.aqui") is None


def test_decode_access_token_retorna_none_para_token_expirado(monkeypatch):
    user = make_user()
    monkeypatch.setattr(
        "app.services.security.ACCESS_TOKEN_EXPIRE_MINUTES", 0
    )
    token = create_access_token(user)
    # Aguarda 1 segundo para garantir expiração
    time.sleep(1)
    assert decode_access_token(token) is None


def test_decode_access_token_retorna_none_para_assinatura_adulterada():
    user = make_user()
    token = create_access_token(user)
    partes = token.split(".")
    partes[2] = "assinatura-adulterada"
    token_adulterado = ".".join(partes)
    assert decode_access_token(token_adulterado) is None


def test_decode_access_token_retorna_none_para_formato_invalido():
    assert decode_access_token("sem-pontos") is None


# ---------- helpers base64url ----------


def test_base64url_encode_e_decode_sao_reversiveis():
    dados = b"dados de teste para encode"
    encoded = _base64url_encode(dados)
    decoded = _base64url_decode(encoded)
    assert decoded == dados


def test_base64url_encode_json_codifica_dict():
    dados = {"chave": "valor", "numero": 42}
    resultado = _base64url_encode_json(dados)
    assert isinstance(resultado, str)
    assert len(resultado) > 0
