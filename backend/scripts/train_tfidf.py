"""Treino do classificador leve TF-IDF + Regressao Logistica (multi-label).

Alternativa ao LegalBERT pensada para o DEPLOY no Render (CPU, ~512 MB): em vez
de um transformer de 110M parametros (torch + ~440 MB de pesos + ~1 GB de RAM),
usa um modelo lexical classico que:

* cabe em ~3 MB (vai versionado no repo -> sem download/HF/env vars no deploy);
* consome ~175 MB de RAM em producao (numpy+scipy+sklearn), sem torch;
* iguala/supera o F1 do LegalBERT contra os rotulos atuais (weak, lexicais),
  porque os rotulos sao heuristicas de palavra que um modelo lexical capta bem.

Features: uniao de TF-IDF de palavra (1-2 gramas) e de caractere (char_wb 3-5),
robusto ao ruido de OCR dos PDFs da Camara. Classificador OneVsRest com
``class_weight='balanced'`` (a taxonomia e desbalanceada). O threshold de decisao
e calibrado POR CLASSE na particao de validacao (nao ve o teste), o que recupera
as classes raras (ex.: ``inconsistencia``).

Uso::

    .venv\\Scripts\\python.exe scripts\\train_tfidf.py \\
        --dataset data\\dataset_laws_camara.json

Salva ``app/models/tfidf_classifier.pkl`` (bundle: pipeline, thresholds, labels,
model_version), carregado pelo ``TfidfProvider`` em ``analysis_provider.py``.
"""

from __future__ import annotations

import argparse
import json
import pickle
import sys
import warnings
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.multiclass import OneVsRestClassifier
from sklearn.pipeline import FeatureUnion, Pipeline

# Garantir que o diretorio raiz do backend esteja no path para importacoes.
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.analysis_provider import TAXONOMY  # noqa: E402

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BACKEND_DIR / "data" / "dataset_laws_camara.json"
OUTPUT_PATH = BACKEND_DIR / "app" / "models" / "tfidf_classifier.pkl"
LABELS: tuple[str, ...] = TAXONOMY
MODEL_VERSION = "tfidf-lexical-v1"


def load_data(dataset_path: Path) -> tuple[list[str], np.ndarray]:
    """Carrega o dataset JSON como (textos, matriz de rotulos float32)."""
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


def split_indices(labels: np.ndarray, seed: int = 42):
    """Split 80/10/10 estratificado multi-label (fallback aleatorio)."""
    n = len(labels)
    features = np.zeros((n, 1))
    try:
        from iterstrat.ml_stratifiers import MultilabelStratifiedShuffleSplit

        first = MultilabelStratifiedShuffleSplit(
            n_splits=1, test_size=0.2, random_state=seed
        )
        train_idx, temp_idx = next(first.split(features, labels))
        second = MultilabelStratifiedShuffleSplit(
            n_splits=1, test_size=0.5, random_state=seed
        )
        val_rel, test_rel = next(second.split(features[temp_idx], labels[temp_idx]))
        return (
            train_idx,
            temp_idx[val_rel],
            temp_idx[test_rel],
            "multilabel-stratified",
        )
    except Exception as exc:  # noqa: BLE001 - fallback documentado
        warnings.warn(
            f"Estratificacao indisponivel ({exc!r}); split aleatorio.",
            RuntimeWarning,
            stacklevel=2,
        )
        rng = np.random.default_rng(seed)
        perm = rng.permutation(n)
        n_tr = int(n * 0.8)
        val_end = n_tr + int(n * 0.1)
        return (
            perm[:n_tr],
            perm[n_tr:val_end],
            perm[val_end:],
            "random-fallback",
        )


def build_pipeline() -> Pipeline:
    """TF-IDF (palavra 1-2 + caractere 3-5) + OneVsRest LogReg balanceado."""
    feats = FeatureUnion(
        [
            (
                "word",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    min_df=2,
                    max_features=20000,
                    sublinear_tf=True,
                    strip_accents="unicode",
                    lowercase=True,
                ),
            ),
            (
                "char",
                TfidfVectorizer(
                    analyzer="char_wb",
                    ngram_range=(3, 5),
                    min_df=3,
                    max_features=30000,
                    sublinear_tf=True,
                    lowercase=True,
                ),
            ),
        ]
    )
    clf = OneVsRestClassifier(
        LogisticRegression(max_iter=2000, class_weight="balanced", C=6.0)
    )
    return Pipeline([("feats", feats), ("clf", clf)])


def calibrate_thresholds(proba_val: np.ndarray, y_val: np.ndarray) -> list[float]:
    """Escolhe, por classe, o threshold que maximiza o F1 na validacao."""
    grid = np.linspace(0.1, 0.9, 33)
    thresholds: list[float] = []
    for j in range(len(LABELS)):
        scores = [
            f1_score(y_val[:, j], (proba_val[:, j] >= t).astype(int), zero_division=0)
            for t in grid
        ]
        thresholds.append(float(grid[int(np.argmax(scores))]))
    return thresholds


def report(name: str, y_true: np.ndarray, proba: np.ndarray, thresholds) -> None:
    preds = np.zeros_like(proba, dtype=int)
    for j, thr in enumerate(thresholds):
        preds[:, j] = (proba[:, j] >= thr).astype(int)
    macro = f1_score(y_true, preds, average="macro", zero_division=0)
    micro = f1_score(y_true, preds, average="micro", zero_division=0)
    per = f1_score(y_true, preds, average=None, zero_division=0)
    print(f"[{name}] F1-macro={macro:.3f} F1-micro={micro:.3f}")
    print("        " + ", ".join(f"{c}={v:.2f}" for c, v in zip(LABELS, per)))


def main() -> None:
    parser = argparse.ArgumentParser(description="Treino TF-IDF + LogReg multi-label.")
    parser.add_argument("--dataset", type=Path, default=DATASET_PATH)
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    texts, labels = load_data(args.dataset)
    tr, va, te, strategy = split_indices(labels, seed=args.seed)
    print(
        f"[dados] {len(texts)} exemplos | split={strategy} | "
        f"treino={len(tr)} val={len(va)} teste={len(te)}"
    )

    pipe = build_pipeline()
    pipe.fit([texts[i] for i in tr], labels[tr].astype(int))

    proba_val = pipe.predict_proba([texts[i] for i in va])
    thresholds = calibrate_thresholds(proba_val, labels[va].astype(int))
    print(
        "[thr] por classe: "
        + ", ".join(f"{c}={t:.2f}" for c, t in zip(LABELS, thresholds))
    )

    proba_te = pipe.predict_proba([texts[i] for i in te])
    report("teste", labels[te].astype(int), proba_te, thresholds)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    bundle = {
        "pipeline": pipe,
        "thresholds": thresholds,
        "labels": list(LABELS),
        "model_version": MODEL_VERSION,
    }
    with open(args.output, "wb") as handle:
        pickle.dump(bundle, handle)
    print(f"[salvar] {args.output} ({args.output.stat().st_size/1e6:.2f} MB)")


if __name__ == "__main__":
    main()
