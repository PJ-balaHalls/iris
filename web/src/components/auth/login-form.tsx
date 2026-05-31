// web/src/components/auth/login-form.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { resolveSafePostLoginRedirect } from "@/lib/auth/redirects";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "@/schemas/auth/login.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const redirectTo = useMemo(
    () => resolveSafePostLoginRedirect(searchParams.get("redirectTo")),
    [searchParams],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberSession: true,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);

    const supabase = createSupabaseBrowserClient({
      persistSession: values.rememberSession,
    });

    if (!supabase) {
      setFormError(
        "Ambiente de autenticação indisponível. Verifique a configuração pública do Supabase.",
      );
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setFormError("E-mail ou senha inválidos. Verifique os dados e tente novamente.");
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setFormError("Não foi possível acessar agora. Tente novamente em alguns instantes.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-4">
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-[2.62rem] size-4 text-foreground-muted"
            aria-hidden="true"
          />

          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@iris.com"
            className="pl-11"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute left-4 top-[2.62rem] size-4 text-foreground-muted"
            aria-hidden="true"
          />

          <Input
            label="Senha"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            className="pl-11 pr-12"
            error={errors.password?.message}
            {...register("password")}
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-[2.45rem] rounded-full p-1 text-foreground-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-focus/20"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Checkbox label="Manter sessão" {...register("rememberSession")} />

        <Link
          href="/forgot-password"
          className="text-sm font-medium text-accent underline-offset-4 transition hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-6 text-danger"
        >
          {formError}
        </div>
      ) : null}

      <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Acessando...
          </>
        ) : (
          "Acessar painel admin"
        )}
      </Button>

      <p className="text-center text-sm leading-6 text-foreground-secondary">
        Ainda não tem acesso?{" "}
        <Link
          href="/register"
          className="font-medium text-accent underline-offset-4 transition hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
