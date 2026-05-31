// web/src/components/onboarding/steps/step-internal-creation-key.tsx
import { KeyRound, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { OnboardingStepProps } from "@/components/onboarding/types";

export function StepInternalCreationKey({ form }: Pick<OnboardingStepProps, "form">) {
  const hasInternalCreationKey = form.watch("hasInternalCreationKey");

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
          Chave interna
        </p>

        <h2 className="mt-3 text-h2 font-semibold tracking-[-0.04em] text-foreground">
          Acesso interno com governança.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Funcionários podem seguir sem chave e receber um perfil interno inicial.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <Checkbox
              label="Tenho uma chave de criação"
              {...form.register("hasInternalCreationKey")}
            />

            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              A chave é validada somente no servidor. Ela não será salva em texto puro.
            </p>
          </div>
        </div>
      </div>

      {hasInternalCreationKey ? (
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute left-4 top-[2.62rem] size-4 text-foreground-muted"
            aria-hidden="true"
          />

          <Input
            label="Chave de criação"
            type="password"
            autoComplete="off"
            placeholder="Insira a chave fornecida pela Root Governance"
            className="pl-11"
            helperText="A chave não será salva em texto puro."
            {...form.register("internalCreationKey")}
          />
        </div>
      ) : null}
    </section>
  );
}
