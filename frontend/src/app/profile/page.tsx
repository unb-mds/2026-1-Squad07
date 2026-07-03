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
  }, [user.id, token, updateUserInSession]);

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
        <label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
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
          className="bg-muted text-foreground border-border focus:border-primary"
        />
        {error && (
          <p id="name-error" className="text-xs font-medium text-[var(--error)]">{error}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="bg-muted text-muted-foreground border-border opacity-70"
        />
      </div>

      <div className="rounded-lg bg-muted p-4 border border-border flex items-start gap-3">
        <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tipo de Conta</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Nível de acesso do usuário no sistema CrivoAI.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary border border-primary/20 uppercase">
              {user.role}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {user.role === "ADMIN" ? "Administrador" : "Usuário Comum"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="border-border text-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:opacity-90"
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
      <div className="flex min-h-[50vh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8c] dark:bg-none dark:bg-card dark:border-b dark:border-border px-6 py-8 text-white">
          <h1 className="text-2xl font-bold dark:text-foreground">Meu Perfil</h1>
          <p className="mt-1 text-sm text-blue-100 dark:text-muted-foreground">
            Gerencie as informações básicas da sua conta.
          </p>
        </div>

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