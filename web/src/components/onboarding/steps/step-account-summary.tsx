// web/src/components/onboarding/steps/step-account-summary.tsx
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { OnboardingStepProps } from "@/components/onboarding/types";
import { translateBotanicIdentityToUi } from "@/lib/botanic/identity";
import type { OnboardingFormValues } from "@/schemas/onboarding.schema";

function getPredictedSpecies(values: OnboardingFormValues) {
  if (values.accountScope === "internal") return "TULIPA";

  if (
    values.externalAccountType === "business_partner" ||
    values.externalAccountType === "supplier" ||
    values.externalAccountType === "service_provider"
  ) {
    return "ORQUIDEA";
  }

  return "LOTUS";
}

function SummaryRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-foreground-muted">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function StepAccountSummary({ form }: Pick<OnboardingStepProps, "form">) {
  const values = form.getValues();
  const translated = translateBotanicIdentityToUi({
    speciesCode: getPredictedSpecies(values),
    stageCode: "BROTO",
    inclinationCode: values.botanicInclination || "NULO",
  });

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
          Resumo da conta
        </p>

        <h2 className="mt-3 text-h2 font-semibold tracking-[-0.04em] text-foreground">
          Revise antes de criar.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Esta etapa confirma a conta, o perfil inicial e a identidade operacional que
          será gerada no backend.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <SummaryRow label="Nome" value={values.fullName || "Não informado"} />
        <SummaryRow label="Username" value={values.username ? "@" + values.username : "Não informado"} />
        <SummaryRow label="E-mail" value={values.email || "Não informado"} />
        <SummaryRow
          label="Tipo de conta"
          value={values.accountScope === "internal" ? "Interna / Equipe IRÍS" : "Externa / Ecossistema"}
        />
        <SummaryRow
          label="Vínculo"
          value={
            values.accountScope === "internal"
              ? values.internalTeam || "Time não definido"
              : values.organizationName || "Organização não definida"
          }
        />
        <SummaryRow label="Status inicial" value={translated.speciesLabel} />
        <SummaryRow label="Estágio inicial" value={translated.stageLabel} />
        <SummaryRow label="Foco inicial" value={translated.inclinationLabel} />
      </div>

      <div className="rounded-2xl border border-success/30 bg-success/10 p-5">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>

          <div>
            <p className="text-sm font-medium text-foreground">
              Privacidade e segurança preservadas
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">
              CPF não será salvo puro. O código Flora completo será gerado pelo banco.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-start gap-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-sm leading-6 text-foreground-secondary">
            Ao concluir, a conta será criada e o onboarding será finalizado sem redirecionamento automático.
          </p>
        </div>
      </div>
    </section>
  );
}
