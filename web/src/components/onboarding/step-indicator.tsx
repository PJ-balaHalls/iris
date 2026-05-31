// web/src/components/onboarding/step-indicator.tsx
import { CheckCircle2 } from "lucide-react";

type StepIndicatorProps = {
  steps: string[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="rounded-2xl border border-border bg-background/80 p-3 shadow-irisSm">
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium text-foreground-muted">
            Etapa {currentStep + 1} de {steps.length}
          </p>
          <p className="truncate text-xs font-medium text-foreground">
            {steps[currentStep]}
          </p>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: progress + "%" }}
          />
        </div>
      </div>

      <div className="hidden gap-2 md:grid md:grid-cols-6 xl:grid-cols-9">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;

          return (
            <div
              key={step}
              className={[
                "flex items-center gap-2 rounded-xl px-3 py-2 transition",
                isActive ? "bg-accent/10" : "bg-transparent",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  isActive
                    ? "border-accent bg-accent text-white"
                    : isDone
                      ? "border-accent bg-surface text-accent"
                      : "border-border bg-surface text-foreground-muted",
                ].join(" ")}
              >
                {isDone ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : index + 1}
              </span>

              <span
                className={[
                  "hidden truncate text-xs font-medium lg:inline",
                  isActive ? "text-foreground" : "text-foreground-muted",
                ].join(" ")}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
