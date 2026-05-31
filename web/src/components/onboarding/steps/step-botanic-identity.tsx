// web/src/components/onboarding/steps/step-botanic-identity.tsx
import { Leaf, Sparkles } from "lucide-react";
import { OptionList } from "@/components/ui/option-list";
import { translateBotanicIdentityToUi } from "@/lib/botanic/identity";
import type { OnboardingStepProps } from "@/components/onboarding/types";
import type { OnboardingFormValues } from "@/schemas/onboarding.schema";

const inclinationOptions = [
  {
    value: "NULO",
    label: "Ainda sem foco definido",
    eyebrow: "Flexível",
    description: "A experiência inicial não força uma direção específica.",
  },
  {
    value: "INTROSPECTIVA",
    label: "Introspecção e diários",
    eyebrow: "Individual",
    description: "Prioriza reflexão, escrita íntima e organização de memória.",
  },
  {
    value: "SIMBIOTICA",
    label: "Memórias compartilhadas",
    eyebrow: "usLIFE",
    description: "Prioriza espaços compartilhados, casal, família ou parceria íntima.",
  },
  {
    value: "CULTURAL",
    label: "Cultura e descobertas",
    eyebrow: "Exploração",
    description: "Prioriza ensaios, repertório, criação, feed cultural e conexões artísticas.",
  },
] as const;

function getPredictedSpecies(accountScope: OnboardingFormValues["accountScope"], externalType?: string) {
  if (accountScope === "internal") return "TULIPA";
  if (
    externalType === "business_partner" ||
    externalType === "supplier" ||
    externalType === "service_provider"
  ) {
    return "ORQUIDEA";
  }

  return "LOTUS";
}

export function StepBotanicIdentity({ form }: Pick<OnboardingStepProps, "form">) {
  const accountScope = form.watch("accountScope");
  const externalAccountType = form.watch("externalAccountType");
  const botanicInclination = form.watch("botanicInclination");

  const predicted = translateBotanicIdentityToUi({
    speciesCode: getPredictedSpecies(accountScope, externalAccountType),
    stageCode: "BROTO",
    inclinationCode: botanicInclination || "NULO",
  });

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
          Motor Flora
        </p>

        <h2 className="mt-3 text-h2 font-semibold tracking-[-0.04em] text-foreground">
          Defina o foco inicial da experiência.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
          A estrutura botânica opera nos bastidores. Na interface, isso aparece como
          status de conta, foco inicial e identificador de suporte.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <Leaf className="size-5" aria-hidden="true" />
          </span>

          <div>
            <p className="text-sm font-medium text-foreground">
              Identidade prevista: {predicted.speciesLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">
              Status inicial: {predicted.stageLabel}. Foco: {predicted.inclinationLabel}.
            </p>
          </div>
        </div>
      </div>

      <OptionList
        label="Foco inicial"
        description="Escolha como a plataforma deve organizar a primeira experiência desta conta."
        columns={2}
        items={[...inclinationOptions]}
        value={botanicInclination}
        onChange={(value) => {
          form.setValue("botanicInclination", value as OnboardingFormValues["botanicInclination"], {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />

      <div className="rounded-2xl border border-emotion/30 bg-emotion/10 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-emotion" aria-hidden="true" />
          <p className="text-sm leading-6 text-foreground-secondary">
            Perfis IRIS-BIOMA e permissões supremas não são escolhidos no cadastro.
          </p>
        </div>
      </div>
    </section>
  );
}
