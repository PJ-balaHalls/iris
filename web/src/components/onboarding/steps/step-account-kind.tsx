// web/src/components/onboarding/steps/step-account-kind.tsx
import type { OnboardingStepProps } from "@/components/onboarding/types";
import { externalAccountTypes, internalRoles } from "@/constants/onboarding";
import { OptionList } from "@/components/ui/option-list";

export function StepAccountKind({ form }: Pick<OnboardingStepProps, "form">) {
  const accountScope = form.watch("accountScope");
  const internalRole = form.watch("internalRole");
  const externalAccountType = form.watch("externalAccountType");

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
          Etapa 2
        </p>
        <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
          {accountScope === "internal" ? "Qual é sua função?" : "Como você quer entrar no IRÍS?"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          {accountScope === "internal"
            ? "Essa escolha orienta permissões, dashboards e conteúdo interno."
            : "Usuários comuns não precisam cadastrar organização. Contas institucionais seguem validação separada."}
        </p>
      </div>

      <OptionList
        items={(accountScope === "internal" ? internalRoles : externalAccountTypes).map((item) => ({
          value: item.value,
          label: item.label,
          description: item.description,
        }))}
        value={accountScope === "internal" ? internalRole : externalAccountType}
        onChange={(value) => {
          if (accountScope === "internal") {
            form.setValue("internalRole", value as never, { shouldDirty: true });
            form.setValue("internalTeam", undefined, { shouldDirty: true });
          } else {
            form.setValue("externalAccountType", value as never, { shouldDirty: true });
            form.setValue("organizationFlow", "none", { shouldDirty: true });
            form.setValue("organizationId", undefined, { shouldDirty: true });
            form.setValue("organizationRelation", undefined, { shouldDirty: true });
          }
        }}
        columns={accountScope === "internal" ? 3 : 2}
      />
    </section>
  );
}
