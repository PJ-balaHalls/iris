// web/src/components/onboarding/steps/step-user-profile.tsx
import Link from "next/link";
import { Baby, ShieldCheck, UserRound } from "lucide-react";
import { AddressLookupCard } from "@/components/onboarding/shared/address-lookup-card";
import type { OnboardingStepProps } from "@/components/onboarding/types";
import { calculateAge, formatCpf } from "@/components/onboarding/utils";
import { CalendarInput } from "@/components/ui/calendar-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export function StepUserProfile({ form, usernameStatus }: OnboardingStepProps) {
  const accountScope = form.watch("accountScope");
  const birthDate = form.watch("birthDate");
  const cpf = form.watch("cpf");
  const age = calculateAge(birthDate);
  const isMinor = typeof age === "number" && age < 18;

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
          Etapa 5
        </p>
        <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
          Identidade administrativa
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Esta etapa organiza identificação, @ interno, idade e endereço sem transformar o fluxo
          em um formulário genérico.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.74fr_1.26fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-5">
            <span className="flex size-11 items-center justify-center rounded-full bg-accent text-white">
              <UserRound className="size-5" aria-hidden="true" />
            </span>

            <h3 className="mt-5 font-serif text-h3 tracking-[-0.04em] text-foreground">
              Perfil humano, acesso técnico
            </h3>
            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              O admin usa dados pessoais apenas para identificação, permissões e segurança.
            </p>
          </div>

          {isMinor ? (
            <div className="animate-[iris-soft-enter_360ms_ease-out] rounded-2xl border border-emotion/40 bg-emotion/10 p-5">
              <span className="flex size-11 items-center justify-center rounded-full bg-emotion text-white">
                <Baby className="size-5" aria-hidden="true" />
              </span>

              <h3 className="mt-5 font-serif text-h3 tracking-[-0.04em] text-foreground">
                Conta Kids detectada
              </h3>
              <p className="mt-3 text-sm leading-6 text-foreground-secondary">
                Pela data informada, este acesso será tratado como conta protegida para menores,
                com isolamento e regras específicas.
              </p>
              <Link
                href="/kids"
                className="mt-4 inline-flex text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Entender regras do IRÍS Kids
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background p-5">
              <ShieldCheck className="size-5 text-accent" aria-hidden="true" />
              <p className="mt-3 text-sm leading-6 text-foreground-secondary">
                CPF é formatado no front e tratado no backend sem persistir texto puro.
              </p>
            </div>
          )}
        </aside>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Nome completo" placeholder="Seu nome completo" {...form.register("fullName")} />

              <div>
                <Input label="Apelido / @" placeholder="seu_usuario" {...form.register("username")} />
                <p
                  className={[
                    "mt-2 text-xs leading-5",
                    usernameStatus.state === "available"
                      ? "text-success"
                      : usernameStatus.state === "unavailable"
                        ? "text-danger"
                        : "text-foreground-muted",
                  ].join(" ")}
                >
                  {usernameStatus.message}
                </p>
              </div>

              <Input
                label="CPF"
                placeholder="000.000.000-00"
                value={cpf ?? ""}
                onChange={(event) =>
                  form.setValue("cpf", formatCpf(event.target.value), { shouldDirty: true })
                }
              />

              <CalendarInput
                label="Data de nascimento"
                value={birthDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(value) => form.setValue("birthDate", value, { shouldDirty: true })}
                helperText={age === null ? "Informe para validação de idade." : `${age} ano(s) detectado(s).`}
              />
            </div>
          </div>

          <AddressLookupCard form={form} />

          <div className="space-y-3 rounded-2xl border border-border bg-background p-5">
            <Checkbox label="Aceito os termos de uso do IRÍS Admin" {...form.register("acceptedTerms")} />

            {accountScope === "external" ? (
              <Checkbox
                label="Aceito os termos específicos para parceiros, clientes e fornecedores"
                {...form.register("acceptedPartnerTerms")}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
