import json
import sys
from pathlib import Path

import torch
from torch.utils.data import Dataset
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)

# Garantir que o diretório raiz do backend esteja no path para importações
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.analysis_provider import TAXONOMY, DEFAULT_MODEL_NAME  # noqa: E402

MODEL_OUTPUT_DIR = (
    Path(__file__).resolve().parent.parent / "app" / "models" / "fine_tuned_legalbert"
)
DATASET_PATH = Path(__file__).resolve().parent.parent / "data" / "dataset_laws.json"


class LawsDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=512):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt",
        )

        item = {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
        }

        # Converte as labels para um tensor float de tamanho 4 (multi-label)
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.float)
        return item


def load_dataset():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset não encontrado em {DATASET_PATH}")

    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    texts = []
    labels = []

    for item in data:
        texts.append(item["text"])

        # Garante a ordem exata de acordo com a taxonomia do backend
        label_vector = [float(item["labels"].get(cat, 0.0)) for cat in TAXONOMY]
        labels.append(label_vector)

    return texts, labels


def main():
    print("--- Iniciando Fine-tuning do LegalBERT-pt ---")
    print(f"Carregando dataset de {DATASET_PATH}...")
    texts, labels = load_dataset()
    print(f"Total de exemplos carregados: {len(texts)}")

    print(f"Carregando tokenizer para {DEFAULT_MODEL_NAME}...")
    tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL_NAME)

    print("Preparando datasets...")
    dataset = LawsDataset(texts, labels, tokenizer)

    print(f"Carregando modelo {DEFAULT_MODEL_NAME} com {len(TAXONOMY)} labels...")
    # Configura para multi-label classification
    model = AutoModelForSequenceClassification.from_pretrained(
        DEFAULT_MODEL_NAME,
        num_labels=len(TAXONOMY),
        problem_type="multi_label_classification",
    )

    print("Configurando argumentos de treinamento (CPU-friendly)...")
    # Configuração leve para desenvolvimento e testes
    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=3,
        per_device_train_batch_size=2,
        warmup_steps=0,
        weight_decay=0.01,
        logging_dir="./logs",
        logging_steps=1,
        learning_rate=2e-5,
        use_cpu=True,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
    )

    print("Iniciando treinamento...")
    trainer.train()

    print(f"Salvando o modelo ajustado localmente em {MODEL_OUTPUT_DIR}...")
    MODEL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(MODEL_OUTPUT_DIR))
    tokenizer.save_pretrained(str(MODEL_OUTPUT_DIR))

    print("--- Treinamento concluído com sucesso! ---")


if __name__ == "__main__":
    main()
