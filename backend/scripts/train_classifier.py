"""Fine-tuning multi-label do LegalBERT-pt para o classificador do CrivoAI.

Versao definitiva do pipeline de treino (Fases 1-3 do documento
``docs/dev/plano-expansao-ml.md``). Principais caracteristicas:

* Divisao ESTRATIFICADA 80/10/10 (treino/validacao/teste) apropriada para
  multi-label via ``MultilabelStratifiedShuffleSplit`` (iterative-stratification),
  com fallback aleatorio documentado quando a estratificacao nao e viavel
  (dataset muito pequeno / classes raras).
* Tokenizacao com ``raquelsilveira/legalbertpt_fp`` (``max_length=512``,
  ``truncation=True``) e padding DINAMICO por batch para economizar VRAM.
* ``TrainingArguments`` otimizado para 8 GB de VRAM (RTX 5060 / Blackwell):
  ``bf16`` nativo quando ha GPU, batch pequeno + ``gradient_accumulation_steps``
  para atingir um batch efetivo maior, e ``gradient_checkpointing`` opcional.
* Deteccao automatica de device (GPU quando disponivel, com fallback gracioso
  para CPU emitindo um WARNING claro em vez de quebrar).
* ``compute_metrics`` robusto para multi-label (sigmoid + threshold): F1 macro
  e micro, precision/recall (macro e micro) e F1 por categoria.
* ``Trainer`` customizado com ``BCEWithLogitsLoss`` e ``pos_weight`` calculado
  DINAMICAMENTE a partir da frequencia das classes no conjunto de TREINO
  (sem vazar validacao/teste), mitigando o desbalanceamento das 4 tags.

Uso tipico::

    .venv\\Scripts\\python.exe scripts\\train_classifier.py --epochs 8

Smoke test rapido (poucos passos, para validar GPU/pipeline)::

    .venv\\Scripts\\python.exe scripts\\train_classifier.py --max-steps 2 \\
        --epochs 1 --train-batch-size 2
"""

from __future__ import annotations

import argparse
import json
import math
import random
import sys
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence

import numpy as np
import torch
from torch import nn
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    EarlyStoppingCallback,
    Trainer,
    TrainingArguments,
)

# Garantir que o diretorio raiz do backend esteja no path para importacoes.
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.analysis_provider import (  # noqa: E402
    DEFAULT_MODEL_NAME,
    TAXONOMY,
)

BACKEND_DIR = Path(__file__).resolve().parent.parent
MODEL_OUTPUT_DIR = BACKEND_DIR / "app" / "models" / "fine_tuned_legalbert"
DATASET_PATH = BACKEND_DIR / "data" / "dataset_laws.json"

# Rotulos na ordem canonica da taxonomia do backend (REQ-015).
LABELS: tuple[str, ...] = TAXONOMY


# ---------------------------------------------------------------------------
# 1. Carregamento dos dados
# ---------------------------------------------------------------------------
def load_data(
    dataset_path: Path = DATASET_PATH,
) -> tuple[list[str], np.ndarray]:
    """Carrega ``dataset_laws.json`` como textos + matriz de rotulos.

    A matriz de rotulos tem shape ``(n_exemplos, len(LABELS))`` e dtype
    ``float32``, seguindo exatamente a ordem de :data:`LABELS`.
    """
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset nao encontrado em {dataset_path}")

    with open(dataset_path, "r", encoding="utf-8") as handle:
        raw = json.load(handle)

    if not raw:
        raise ValueError("Dataset vazio: nada para treinar.")

    texts: list[str] = []
    labels: list[list[float]] = []
    for item in raw:
        texts.append(str(item["text"]))
        item_labels = item.get("labels", {})
        labels.append([float(item_labels.get(cat, 0.0)) for cat in LABELS])

    return texts, np.asarray(labels, dtype=np.float32)


# ---------------------------------------------------------------------------
# 2. Divisao estratificada 80/10/10 (multi-label)
# ---------------------------------------------------------------------------
@dataclass
class DataSplit:
    """Indices de treino/validacao/teste e a estrategia usada."""

    train_idx: np.ndarray
    val_idx: np.ndarray
    test_idx: np.ndarray
    strategy: str


def _random_split(
    n_samples: int, seed: int
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Fallback aleatorio 80/10/10 garantindo splits nao vazios.

    Usado quando a estratificacao multi-label nao e viavel (dataset muito
    pequeno ou classes raras). Para ``n >= 3`` garante ao menos 1 exemplo em
    validacao e 1 em teste.
    """
    rng = np.random.default_rng(seed)
    indices = rng.permutation(n_samples)

    if n_samples < 3:
        # Nao ha exemplos suficientes para tres particoes; tudo vai p/ treino.
        return indices, np.array([], dtype=int), np.array([], dtype=int)

    n_test = max(1, round(n_samples * 0.1))
    n_val = max(1, round(n_samples * 0.1))
    # Garante que sobre pelo menos 1 exemplo para treino.
    n_val = min(n_val, n_samples - n_test - 1)
    n_val = max(1, n_val)

    val_end = n_test + n_val
    test_idx = indices[:n_test]
    val_idx = indices[n_test:val_end]
    train_idx = indices[val_end:]
    return train_idx, val_idx, test_idx


def split_data(labels: np.ndarray, seed: int = 42) -> DataSplit:
    """Divide o dataset em 80/10/10 de forma estratificada por multi-label.

    Tenta usar ``MultilabelStratifiedShuffleSplit``. Se a biblioteca nao estiver
    instalada, ou se a estratificacao falhar (comum com dataset minusculo),
    cai para um split aleatorio, documentando a escolha via ``strategy``.
    """
    n_samples = len(labels)
    strategy = "multilabel-stratified"

    try:
        from iterstrat.ml_stratifiers import (
            MultilabelStratifiedShuffleSplit,
        )

        features = np.zeros((n_samples, 1))
        first = MultilabelStratifiedShuffleSplit(
            n_splits=1, test_size=0.2, random_state=seed
        )
        train_idx, temp_idx = next(first.split(features, labels))

        second = MultilabelStratifiedShuffleSplit(
            n_splits=1, test_size=0.5, random_state=seed
        )
        temp_features = np.zeros((len(temp_idx), 1))
        val_rel, test_rel = next(second.split(temp_features, labels[temp_idx]))
        val_idx = temp_idx[val_rel]
        test_idx = temp_idx[test_rel]
    except ImportError:
        warnings.warn(
            "iterative-stratification nao instalado; usando split aleatorio "
            "(instale 'iterative-stratification' para estratificacao real).",
            RuntimeWarning,
            stacklevel=2,
        )
        train_idx, val_idx, test_idx = _random_split(n_samples, seed)
        strategy = "random-fallback (sem iterative-stratification)"
    except Exception as exc:  # noqa: BLE001 - dataset pequeno / classes raras
        warnings.warn(
            f"Estratificacao multi-label falhou ({exc!r}); usando split "
            "aleatorio como fallback.",
            RuntimeWarning,
            stacklevel=2,
        )
        train_idx, val_idx, test_idx = _random_split(n_samples, seed)
        strategy = "random-fallback (estratificacao falhou)"

    return DataSplit(
        train_idx=np.asarray(train_idx, dtype=int),
        val_idx=np.asarray(val_idx, dtype=int),
        test_idx=np.asarray(test_idx, dtype=int),
        strategy=strategy,
    )


# ---------------------------------------------------------------------------
# 3. Tokenizacao
# ---------------------------------------------------------------------------
def build_tokenizer(model_name: str) -> Any:
    """Carrega o tokenizer do modelo base."""
    return AutoTokenizer.from_pretrained(model_name)


def tokenize(
    texts: Sequence[str],
    labels: np.ndarray,
    tokenizer: Any,
    max_length: int = 512,
) -> list[dict[str, Any]]:
    """Tokeniza os textos (sem padding) mantendo os rotulos float.

    O padding e feito dinamicamente por batch pelo :class:`MultiLabelCollator`,
    economizando VRAM em relacao ao ``padding='max_length'``.
    """
    encodings = tokenizer(
        list(texts),
        truncation=True,
        max_length=max_length,
    )

    features: list[dict[str, Any]] = []
    for i in range(len(texts)):
        feature = {key: encodings[key][i] for key in encodings}
        feature["labels"] = labels[i].astype(np.float32).tolist()
        features.append(feature)
    return features


@dataclass
class MultiLabelCollator:
    """Data collator com padding dinamico para classificacao multi-label.

    Faz o padding das entradas do tokenizer por batch e empilha os vetores de
    rotulo como um tensor ``float`` (exigido por ``BCEWithLogitsLoss`` e pelo
    ``problem_type='multi_label_classification'``).
    """

    tokenizer: Any

    def __call__(self, features: list[dict[str, Any]]) -> dict[str, torch.Tensor]:
        labels = [feature.pop("labels") for feature in features]
        batch = self.tokenizer.pad(features, return_tensors="pt")
        batch["labels"] = torch.tensor(labels, dtype=torch.float)
        return batch


# ---------------------------------------------------------------------------
# 4. Pesos de classe (pos_weight) a partir do conjunto de TREINO
# ---------------------------------------------------------------------------
def compute_class_weights(train_labels: np.ndarray) -> torch.Tensor:
    """Calcula ``pos_weight`` por classe a partir do conjunto de treino.

    Para ``BCEWithLogitsLoss``, ``pos_weight = n_negativos / n_positivos`` por
    classe, dando mais peso aos positivos das classes minoritarias. Calculado
    APENAS no treino, para nao vazar informacao de validacao/teste. Classes sem
    exemplos positivos recebem peso 1.0 (neutro) para evitar divisao por zero.
    """
    n_samples = len(train_labels)
    positives = train_labels.sum(axis=0)
    weights = np.ones(len(LABELS), dtype=np.float32)

    for i, n_pos in enumerate(positives):
        if n_pos > 0:
            n_neg = n_samples - n_pos
            weights[i] = float(n_neg) / float(n_pos)

    return torch.tensor(weights, dtype=torch.float)


# ---------------------------------------------------------------------------
# 5. Metricas multi-label
# ---------------------------------------------------------------------------
def build_compute_metrics(threshold: float = 0.5) -> Any:
    """Cria a funcao ``compute_metrics`` para o ``Trainer`` (multi-label).

    Aplica sigmoid nos logits, binariza pelo ``threshold`` e calcula, com o
    scikit-learn (``zero_division=0``): F1 macro/micro, precision e recall
    (macro e micro) e F1 por categoria.
    """
    from sklearn.metrics import f1_score, precision_score, recall_score

    def compute_metrics(eval_pred: Any) -> dict[str, float]:
        logits, labels = eval_pred
        if isinstance(logits, tuple):
            logits = logits[0]
        logits = np.asarray(logits, dtype=np.float32)
        probs = 1.0 / (1.0 + np.exp(-logits))
        preds = (probs >= threshold).astype(int)
        gold = np.asarray(labels, dtype=np.float32).astype(int)

        metrics: dict[str, float] = {
            "f1_macro": f1_score(gold, preds, average="macro", zero_division=0),
            "f1_micro": f1_score(gold, preds, average="micro", zero_division=0),
            "precision_macro": precision_score(
                gold, preds, average="macro", zero_division=0
            ),
            "precision_micro": precision_score(
                gold, preds, average="micro", zero_division=0
            ),
            "recall_macro": recall_score(gold, preds, average="macro", zero_division=0),
            "recall_micro": recall_score(gold, preds, average="micro", zero_division=0),
        }

        per_class_f1 = f1_score(gold, preds, average=None, zero_division=0)
        for name, value in zip(LABELS, np.atleast_1d(per_class_f1)):
            metrics[f"f1_{name}"] = float(value)

        return {key: float(value) for key, value in metrics.items()}

    return compute_metrics


# ---------------------------------------------------------------------------
# 6. Trainer customizado (BCEWithLogitsLoss + pos_weight)
# ---------------------------------------------------------------------------
class MultiLabelTrainer(Trainer):
    """``Trainer`` com perda BCE ponderada por ``pos_weight`` das classes."""

    def __init__(self, *args: Any, pos_weight: torch.Tensor, **kwargs: Any):
        super().__init__(*args, **kwargs)
        # Buffer nao-treinavel; movido para o device correto no compute_loss.
        self._pos_weight = pos_weight

    def compute_loss(
        self,
        model: Any,
        inputs: dict[str, torch.Tensor],
        return_outputs: bool = False,
        **kwargs: Any,
    ) -> Any:
        labels = inputs.pop("labels")
        outputs = model(**inputs)
        logits = outputs.logits
        loss_fct = nn.BCEWithLogitsLoss(pos_weight=self._pos_weight.to(logits.device))
        loss = loss_fct(logits, labels.float())
        return (loss, outputs) if return_outputs else loss


# ---------------------------------------------------------------------------
# Utilitarios
# ---------------------------------------------------------------------------
def set_seed(seed: int) -> None:
    """Fixa as sementes para reprodutibilidade."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def resolve_device() -> tuple[str, bool]:
    """Detecta o device de treino.

    Retorna ``(device, use_bf16)``. Emite um WARNING claro e cai para CPU
    (sem bf16) quando nao ha GPU CUDA disponivel, em vez de quebrar.
    """
    if torch.cuda.is_available():
        name = torch.cuda.get_device_name(0)
        cap = torch.cuda.get_device_capability(0)
        print(f"[device] GPU detectada: {name} (capability {cap[0]}.{cap[1]})")
        return "cuda", True

    warnings.warn(
        "Nenhuma GPU CUDA disponivel: treinando em CPU (muito mais lento, "
        "bf16 desabilitado). Verifique a instalacao do PyTorch cu128.",
        RuntimeWarning,
        stacklevel=2,
    )
    return "cpu", False


def _summarize_labels(name: str, labels: np.ndarray) -> None:
    """Imprime a contagem de positivos por classe de um subconjunto."""
    if len(labels) == 0:
        print(f"  {name:>10}: 0 exemplos")
        return
    counts = labels.sum(axis=0).astype(int)
    dist = ", ".join(f"{cat}={c}" for cat, c in zip(LABELS, counts))
    print(f"  {name:>10}: {len(labels):>4} exemplos | {dist}")


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------
def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fine-tuning multi-label do LegalBERT-pt (CrivoAI)."
    )
    parser.add_argument("--model-name", default=DEFAULT_MODEL_NAME)
    parser.add_argument("--dataset", type=Path, default=DATASET_PATH)
    parser.add_argument("--output-dir", type=Path, default=MODEL_OUTPUT_DIR)
    parser.add_argument("--epochs", type=float, default=8.0)
    parser.add_argument("--learning-rate", type=float, default=3e-5)
    parser.add_argument("--weight-decay", type=float, default=0.01)
    parser.add_argument("--warmup-ratio", type=float, default=0.1)
    parser.add_argument("--max-length", type=int, default=512)
    parser.add_argument("--threshold", type=float, default=0.5)
    # Config validada empiricamente na RTX 5060 (8 GB) com sequencias de 512
    # tokens em bf16: batch efetivo 16 (8 x 2) tem pico ~3 GB de VRAM, deixando
    # folga para o display. bs=16 direto tambem cabe (~4.5 GB) se preferir.
    parser.add_argument("--train-batch-size", type=int, default=8)
    parser.add_argument("--eval-batch-size", type=int, default=16)
    parser.add_argument("--grad-accum", type=int, default=2)
    parser.add_argument(
        "--gradient-checkpointing",
        action="store_true",
        help="Ativa gradient checkpointing (economiza VRAM, mais lento).",
    )
    parser.add_argument("--early-stopping-patience", type=int, default=3)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--max-steps",
        type=int,
        default=-1,
        help="Limita o numero de passos (para smoke test). -1 = sem limite.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> dict[str, float]:
    args = parse_args(argv)
    set_seed(args.seed)

    print("--- Fine-tuning multi-label do LegalBERT-pt (CrivoAI) ---")
    device, use_bf16 = resolve_device()

    print(f"[dados] Carregando dataset de {args.dataset} ...")
    texts, labels = load_data(args.dataset)
    print(f"[dados] {len(texts)} exemplos | {len(LABELS)} categorias: {LABELS}")

    if len(texts) < 50:
        warnings.warn(
            f"Dataset pequeno ({len(texts)} exemplos): as metricas NAO sao "
            "estatisticamente confiaveis. Expanda para >=500 (plano Fase 1).",
            RuntimeWarning,
            stacklevel=2,
        )

    split = split_data(labels, seed=args.seed)
    print(f"[split] Estrategia: {split.strategy}")
    _summarize_labels("treino", labels[split.train_idx])
    _summarize_labels("validacao", labels[split.val_idx])
    _summarize_labels("teste", labels[split.test_idx])

    has_eval = len(split.val_idx) > 0
    if not has_eval:
        warnings.warn(
            "Conjunto de validacao vazio: early stopping e "
            "load_best_model_at_end serao desativados.",
            RuntimeWarning,
            stacklevel=2,
        )

    print(f"[modelo] Carregando tokenizer/modelo: {args.model_name}")
    tokenizer = build_tokenizer(args.model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        args.model_name,
        num_labels=len(LABELS),
        problem_type="multi_label_classification",
        id2label={i: name for i, name in enumerate(LABELS)},
        label2id={name: i for i, name in enumerate(LABELS)},
    )
    if args.gradient_checkpointing:
        # use_cache e incompativel com gradient checkpointing.
        model.config.use_cache = False

    train_features = tokenize(
        [texts[i] for i in split.train_idx],
        labels[split.train_idx],
        tokenizer,
        max_length=args.max_length,
    )
    val_features = tokenize(
        [texts[i] for i in split.val_idx],
        labels[split.val_idx],
        tokenizer,
        max_length=args.max_length,
    )
    test_features = tokenize(
        [texts[i] for i in split.test_idx],
        labels[split.test_idx],
        tokenizer,
        max_length=args.max_length,
    )

    pos_weight = compute_class_weights(labels[split.train_idx])
    pos_weight_desc = ", ".join(
        f"{cat}={w:.2f}" for cat, w in zip(LABELS, pos_weight.tolist())
    )
    print(f"[loss] pos_weight (do treino): {pos_weight_desc}")

    collator = MultiLabelCollator(tokenizer=tokenizer)
    compute_metrics = build_compute_metrics(threshold=args.threshold)

    # Converte warmup_ratio em warmup_steps explicito (evita a deprecation de
    # `warmup_ratio` no transformers 5.x e mantem o mesmo comportamento).
    effective_batch = args.train_batch_size * args.grad_accum
    steps_per_epoch = max(1, math.ceil(len(train_features) / effective_batch))
    if args.max_steps and args.max_steps > 0:
        total_steps = args.max_steps
    else:
        total_steps = int(math.ceil(steps_per_epoch * args.epochs))
    warmup_steps = int(total_steps * args.warmup_ratio)

    eval_strategy = "epoch" if has_eval else "no"
    training_args = TrainingArguments(
        output_dir=str(BACKEND_DIR / "scripts" / "_train_output"),
        num_train_epochs=args.epochs,
        max_steps=args.max_steps,
        per_device_train_batch_size=args.train_batch_size,
        per_device_eval_batch_size=args.eval_batch_size,
        gradient_accumulation_steps=args.grad_accum,
        gradient_checkpointing=args.gradient_checkpointing,
        learning_rate=args.learning_rate,
        weight_decay=args.weight_decay,
        warmup_steps=warmup_steps,
        bf16=use_bf16,
        eval_strategy=eval_strategy,
        save_strategy=eval_strategy,
        save_total_limit=1,
        load_best_model_at_end=has_eval,
        metric_for_best_model="f1_macro",
        greater_is_better=True,
        logging_steps=1,
        report_to="none",
        seed=args.seed,
    )

    print(
        f"[treino] device={device} bf16={use_bf16} "
        f"batch_por_device={args.train_batch_size} "
        f"grad_accum={args.grad_accum} batch_efetivo={effective_batch} "
        f"grad_checkpointing={args.gradient_checkpointing}"
    )

    callbacks = []
    if has_eval and args.early_stopping_patience > 0:
        callbacks.append(
            EarlyStoppingCallback(early_stopping_patience=args.early_stopping_patience)
        )

    trainer = MultiLabelTrainer(
        model=model,
        args=training_args,
        train_dataset=train_features,
        eval_dataset=val_features if has_eval else None,
        data_collator=collator,
        processing_class=tokenizer,
        compute_metrics=compute_metrics,
        callbacks=callbacks,
        pos_weight=pos_weight,
    )

    print("[treino] Iniciando treinamento ...")
    trainer.train()

    final_metrics: dict[str, float] = {}
    if len(test_features) > 0:
        print("[teste] Avaliando no conjunto de teste independente ...")
        test_metrics = trainer.evaluate(
            eval_dataset=test_features, metric_key_prefix="test"
        )
        final_metrics = {
            key: value
            for key, value in test_metrics.items()
            if isinstance(value, (int, float))
        }
        print("[teste] Metricas no conjunto de teste:")
        for key in sorted(final_metrics):
            print(f"    {key}: {final_metrics[key]:.4f}")
    else:
        warnings.warn(
            "Conjunto de teste vazio: nenhuma metrica final calculada "
            "(dataset pequeno demais).",
            RuntimeWarning,
            stacklevel=2,
        )

    print(f"[salvar] Salvando modelo em {args.output_dir} ...")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(args.output_dir))
    tokenizer.save_pretrained(str(args.output_dir))

    print("--- Treinamento concluido com sucesso! ---")
    return final_metrics


if __name__ == "__main__":
    main()
