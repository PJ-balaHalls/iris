// web/src/components/onboarding/steps/step-email.tsx
import { Mail } from "lucide-react";
import { PasswordRequirements } from "@/components/onboarding/shared/password-requirements";
import type { OnboardingStepProps } from "@/components/onboarding/types";
import { IRIS_INTERNAL_DOMAIN } from "@/constants/onboarding";
import { Input } from "@/components/ui/input";

export function StepEmail({ form }: Pick<OnboardingStepProps, "form">) {
  const email = form.watch("email");
  const accountScope = form.watch("accountScope");
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
          Etapa 1
        </p>
        <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
          Comece pelo e-mail
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Domínios @{IRIS_INTERNAL_DOMAIN} entram como funcionários internos. Outros domínios seguem
          fluxo externo, com termos e permissões adaptadas.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.86fr]">
        <div className="space-y-4">
          <Input label="E-mail" type="email" placeholder="voce@iris.com" {...form.register("email")} />

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres" {...form.register("password")} />
            <Input label="Confirmar senha" type="password" placeholder="Repita sua senha" {...form.register("confirmPassword")} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground-secondary">
            <Mail className="mb-3 size-5 text-accent" aria-hidden="true" />
            <p>
              Fluxo detectado:{" "}
              <strong className="text-foreground">
                {accountScope === "internal" ? "funcionário interno" : "parceiro/cliente externo"}
              </strong>
            </p>
            {email ? (
              <p className="mt-2 text-xs leading-5 text-foreground-muted">
                O tipo de conta muda automaticamente em tempo real conforme o domínio.
              </p>
            ) : null}
          </div>

          <PasswordRequirements password={password} confirmPassword={confirmPassword} />
        </div>
      </div>
    </section>
  );
}
