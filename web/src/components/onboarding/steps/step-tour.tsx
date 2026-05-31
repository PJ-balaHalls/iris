// web/src/components/onboarding/steps/step-tour.tsx
import { Sparkles } from "lucide-react";
import type { OnboardingStepProps } from "@/components/onboarding/types";
import { tourCards } from "@/constants/onboarding";
import { Checkbox } from "@/components/ui/checkbox";

export function StepTour({ form }: Pick<OnboardingStepProps, "form">) {
  const accountScope = form.watch("accountScope");
  const internalRole = form.watch("internalRole");

  const tourItems =
    accountScope === "external"
      ? tourCards.external
      : internalRole
        ? tourCards[internalRole]
        : tourCards.dev;

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
          Etapa 6
        </p>
        <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
          Boas-vindas ao admin
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Ao concluir, o acesso será criado e ficará pronto. Não redirecionamos automaticamente:
          você escolhe o próximo passo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tourItems.map((item, index) => (
          <div
            key={item}
            className="rounded-2xl border border-border bg-background p-5 shadow-irisSm"
            style={{ animation: `iris-soft-enter 360ms ease-out ${index * 70}ms both` }}
          >
            <Sparkles className="mb-4 size-5 text-emotion" aria-hidden="true" />
            <p className="text-sm leading-6 text-foreground-secondary">{item}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <Checkbox
          label="Exibir tour ao entrar no dashboard"
          {...form.register("allowTour")}
        />
      </div>
    </section>
  );
}
