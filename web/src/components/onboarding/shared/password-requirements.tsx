// web/src/components/onboarding/shared/password-requirements.tsx
import { CheckCircle2, Circle } from "lucide-react";
import { getPasswordChecks } from "@/components/onboarding/utils";

type PasswordRequirementsProps = {
  password: string;
  confirmPassword: string;
};

export function PasswordRequirements({
  password,
  confirmPassword,
}: PasswordRequirementsProps) {
  const checks = getPasswordChecks(password, confirmPassword);

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="mb-3 text-sm font-medium text-foreground">Critérios de segurança</p>

      <div className="grid gap-2 md:grid-cols-2">
        {checks.map((check) => (
          <div key={check.key} className="flex items-center gap-2 text-sm">
            {check.valid ? (
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            ) : (
              <Circle className="size-4 text-foreground-muted" aria-hidden="true" />
            )}

            <span className={check.valid ? "text-foreground" : "text-foreground-muted"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
