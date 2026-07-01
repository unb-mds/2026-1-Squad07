"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type AuthUser } from "../../contexts/AuthContext";
import { getProfile, updateProfile } from "../../lib/api/users";
import { toast } from "sonner";
import { Loader2, User, Mail, Shield, Save, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface ProfileFormProps {
  user: AuthUser;
  token: string;
  updateUserInSession: (updatedUser: AuthUser) => void;
}

function ProfileForm({ user, token, updateUserInSession }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar dados do perfil em tempo real na API ao carregar a página
  useEffect(() => {
    let active = true;

    async function fetchUserData() {
      try {
        const freshUser = await getProfile(user.id, token);
        if (active) {
          updateUserInSession(freshUser);
          setName(freshUser.name);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do perfil na API:", err);
        toast.error("Não foi possível sincronizar seus dados em tempo real.");
      }
    }

    void fetchUserData();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, token]);

  const handleCancel = () => {
    setName(user.name);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 3) {
      setError("O nome deve conter pelo menos 3 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await updateProfile(user.id, name.trim(), token);
      updateUserInSession(updatedUser);
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          Nome
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? "name-error" : undefined}
        />
        {error && (
          <p id="name-error" className="text-xs font-medium text-red-500">{error}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Mail className="h-4 w-4 text-slate-400" />
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
        />
      </div>

      <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 flex items-start gap-3">
        <Shield className="h-5 w-5 text-slate-400 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Tipo de Conta</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nível de acesso do usuário no sistema CrivoAI.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 border border-blue-200 uppercase">
              {user.role}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {user.role === "ADMIN" ? "Administrador" : "Usuário Comum"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, updateUserInSession } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        router.push("/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, router]);

  if (!user || !token) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8c] px-6 py-8 text-white">
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="mt-1 text-sm text-blue-100">
            Gerencie as informações básicas da sua conta.
          </p>
        </div>

        {/* 
          O uso da chave key={user.id} no subcomponente reconstrói completamente
          o formulário com o estado inicial correto assim que o usuário é carregado,
          eliminando a necessidade de useEffects sincronizadores síncronos (evita cascading renders).
        */}
        <ProfileForm 
          user={user} 
          token={token} 
          updateUserInSession={updateUserInSession} 
          key={user.id} 
        />
      </div>
    </div>
  );
}
