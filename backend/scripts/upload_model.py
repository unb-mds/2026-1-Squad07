import os
import sys
from pathlib import Path

# Garantir que o diretório raiz do backend esteja no path para importações
sys.path.append(str(Path(__file__).resolve().parent.parent))

try:
    from huggingface_hub import HfApi, get_token
except ImportError:
    print(
        "Erro: A biblioteca huggingface-hub não está instalada. Execute: pip install huggingface-hub"
    )
    sys.exit(1)

MODEL_DIR = (
    Path(__file__).resolve().parent.parent / "app" / "models" / "fine_tuned_legalbert"
)


def main():
    print("--- Script de Upload do Modelo para o Hugging Face Hub ---")

    if not MODEL_DIR.exists() or not (MODEL_DIR / "config.json").exists():
        print(f"Erro: Modelo local não encontrado em {MODEL_DIR}.")
        print("Certifique-se de executar o treinamento primeiro com:")
        print("  python scripts/train_classifier.py")
        sys.exit(1)

    # Obter variáveis necessárias
    repo_id = os.getenv("HF_REPO_ID")
    if not repo_id:
        repo_id = input(
            "Digite o ID do repositório no Hugging Face (ex: seu-usuario/seu-modelo): "
        ).strip()

    # Ordem de resolução do token: env HF_TOKEN -> login em cache (hf auth login)
    # -> prompt interativo (último recurso). Assim o upload roda sem expor o
    # token de escrita no histórico do shell quando já se fez `hf auth login`.
    token = os.getenv("HF_TOKEN") or get_token()
    if not token and sys.stdin.isatty():
        token = input(
            "Digite seu token de escrita do Hugging Face (HF Write Token): "
        ).strip()

    if not repo_id or not token:
        print("Erro: O ID do repositório e o token do Hugging Face são obrigatórios.")
        print("Faça `hf auth login` (ou defina HF_TOKEN) antes de rodar o upload.")
        sys.exit(1)

    # Repositório privado por padrão (modelo experimental / dado institucional).
    # Defina HF_PRIVATE=false explicitamente para publicá-lo aberto.
    private = os.getenv("HF_PRIVATE", "true").strip().lower() not in (
        "false",
        "0",
        "no",
    )

    api = HfApi(token=token)

    try:
        print(f"Verificando / Criando o repositório {repo_id} (privado={private})...")
        api.create_repo(
            repo_id=repo_id,
            repo_type="model",
            exist_ok=True,
            private=private,
        )

        print(
            f"Fazendo o upload de todos os arquivos da pasta {MODEL_DIR} para {repo_id}..."
        )
        api.upload_folder(
            folder_path=str(MODEL_DIR),
            repo_id=repo_id,
            repo_type="model",
        )

        print("\n--- Upload concluído com sucesso! ---")
        print(f"O seu modelo está disponível em: https://huggingface.co/{repo_id}")
        print(
            "\nPara que o backend use este modelo, basta configurar a seguinte variável de ambiente:"
        )
        print(f"  MODEL_NAME={repo_id}")

    except Exception as e:
        print(f"\nErro ao realizar o upload do modelo: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
