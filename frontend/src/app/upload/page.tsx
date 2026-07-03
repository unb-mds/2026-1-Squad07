"use client";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Hash,
  Loader2,
  Type,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiErrorMessage } from "@/lib/api/client";
import { submitLaw } from "@/lib/api/laws";

export default function UploadLawPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!token) {
        router.replace("/login");
      } else {
        setCheckingAuth(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [token, router]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    lawNumber: "",
    lawTitle: "",
    lawDate: "",
    lawText: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isFormValid =
    formData.lawNumber.trim() && formData.lawTitle.trim() && formData.lawText.trim();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const text = readerEvent.target?.result;
        if (typeof text === "string") {
          setFormData((current) => ({ ...current, lawText: text }));
        }
      };
      reader.readAsText(file);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      await submitLaw(
        {
          title: formData.lawTitle.trim(),
          text: formData.lawText.trim(),
          lawNumber: formData.lawNumber.trim(),
          ...(formData.lawDate
            ? { publicationDate: `${formData.lawDate}T00:00:00` }
            : {}),
        },
        token,
      );
      setSubmitSuccess(true);
      window.setTimeout(() => router.push("/search"), 900);
    } catch (requestError) {
      setSubmitError(
        apiErrorMessage(
          requestError,
          "Não foi possível registrar a submissão. Tente novamente.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-96 items-center justify-center gap-2">
        <Loader2 className="size-6 animate-spin text-[#1e3a5f]" />
        <span className="text-sm font-medium text-slate-600">Verificando permissões...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 bg-background">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-lg p-2 transition-colors hover:bg-muted"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Avaliar Nova Lei
          </h1>
          <p className="mt-1 text-muted-foreground">
            Envie um texto legislativo para persistir uma nova submissão para análise.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8"
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Hash className="size-4 text-primary" />
            Número da Lei
          </label>
          <input
            type="text"
            placeholder="Ex: Lei 13.709/2018"
            value={formData.lawNumber}
            onChange={(event) =>
              setFormData({ ...formData, lawNumber: event.target.value })
            }
            className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Type className="size-4 text-primary" />
            Título da Lei
          </label>
          <input
            type="text"
            placeholder="Ex: Lei Geral de Proteção de Dados Pessoais"
            value={formData.lawTitle}
            onChange={(event) =>
              setFormData({ ...formData, lawTitle: event.target.value })
            }
            className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Calendar className="size-4 text-primary" />
            Data de Publicação (opcional)
          </label>
          <input
            type="date"
            value={formData.lawDate}
            onChange={(event) =>
              setFormData({ ...formData, lawDate: event.target.value })
            }
            className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Upload className="size-4 text-primary" />
            Upload de Arquivo (opcional)
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-border p-8 text-center transition-all hover:border-primary hover:bg-muted"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileText className="mx-auto mb-3 size-12 text-muted-foreground/60" />
            {selectedFile ? (
              <>
                <p className="text-sm font-semibold text-foreground">
                  {selectedFile.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground">
                  Clique para fazer upload de um arquivo
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  TXT (PDF, DOC e DOCX serão suportados futuramente)
                </p>
              </>
            )}
          </button>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-foreground">
            <FileText className="size-4 text-primary" />
            Texto da Lei
          </label>
          <textarea
            placeholder="Cole aqui o texto completo da lei para análise..."
            value={formData.lawText}
            onChange={(event) =>
              setFormData({ ...formData, lawText: event.target.value })
            }
            className="min-h-52 w-full resize-y rounded-xl border border-border bg-transparent px-4 py-3 font-serif text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
          <p className="text-xs text-muted-foreground">
            {formData.lawText.length} caracteres
          </p>
        </div>

        {submitError && (
          <div className="rounded-xl border border-[var(--error)] bg-[var(--error)]/10 px-4 py-3 text-sm font-semibold text-[var(--error)]">
            {submitError}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl border border-border bg-transparent px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processando...
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle2 className="size-4" />
                Submissão registrada!
              </>
            ) : (
              "Registrar Submissão"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}