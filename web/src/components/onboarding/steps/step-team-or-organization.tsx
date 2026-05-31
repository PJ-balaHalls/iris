// web/src/components/onboarding/steps/step-team-or-organization.tsx
"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Search, X } from "lucide-react";
import type { OnboardingStepProps } from "@/components/onboarding/types";
import {
  internalTeamsByRole,
  organizationRelations,
  organizationSegments,
} from "@/constants/onboarding";
import { formatCnpj, onlyDigits } from "@/components/onboarding/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionList } from "@/components/ui/option-list";
import { Select } from "@/components/ui/select";

type OrganizationSearchResult = {
  id: string;
  legalName: string;
  cnpj: string | null;
  segment: string | null;
  verificationStatus: string | null;
};

export function StepTeamOrOrganization({ form }: Pick<OnboardingStepProps, "form">) {
  const accountScope = form.watch("accountScope");
  const internalRole = form.watch("internalRole");
  const internalTeam = form.watch("internalTeam");
  const externalAccountType = form.watch("externalAccountType");
  const organizationRelation = form.watch("organizationRelation");
  const organizationCnpj = form.watch("organizationCnpj");
  const organizationName = form.watch("organizationName");
  const organizationId = form.watch("organizationId");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OrganizationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const teams = internalRole
    ? internalTeamsByRole[internalRole].map((team) => ({
        value: team.value,
        label: team.label,
        description: team.description,
      }))
    : [];

  const isPersonalExternal = accountScope === "external" && externalAccountType === "final_customer";

  async function searchOrganizations() {
    const safeQuery = query.trim();

    if (safeQuery.length < 2) {
      setSearchMessage("Digite pelo menos 2 caracteres para buscar.");
      return;
    }

    setIsSearching(true);
    setSearchMessage(null);

    try {
      const response = await fetch("/api/organizations/search?q=" + encodeURIComponent(safeQuery), {
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        ok: boolean;
        organizations?: OrganizationSearchResult[];
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        setResults([]);
        setSearchMessage(payload.message ?? "Não foi possível buscar organizações.");
        return;
      }

      setResults(payload.organizations ?? []);

      if (!payload.organizations?.length) {
        setSearchMessage("Nenhuma organização encontrada. Você pode cadastrar uma nova.");
      }
    } catch {
      setResults([]);
      setSearchMessage("Não foi possível buscar organizações agora.");
    } finally {
      setIsSearching(false);
    }
  }

  if (accountScope === "internal") {
    return (
      <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
        <div>
          <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
            Time
          </p>
          <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
            Time / departamento
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
            O time define quais dashboards, relatórios e ações aparecem no painel.
          </p>
        </div>

        <OptionList
          label="Selecione seu time"
          description="Escolha o núcleo mais próximo da sua atuação principal."
          items={teams}
          value={internalTeam}
          onChange={(value) => form.setValue("internalTeam", value as never, { shouldDirty: true })}
          columns={3}
        />
      </section>
    );
  }

  if (isPersonalExternal) {
    return (
      <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
        <div>
          <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
            Conta pessoal
          </p>
          <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
            Sem vínculo institucional.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
            Você seguirá como usuário comum do ecossistema. Não é necessário buscar ou cadastrar empresa.
          </p>
        </div>

        <div className="rounded-2xl border border-success/30 bg-success/10 p-5">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success text-white">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Fluxo simplificado ativado</p>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                A próxima etapa será seu perfil pessoal, foco Flora, foto/capa/bio e resumo.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
          Organização
        </p>
        <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
          Encontre ou cadastre a organização.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Primeiro buscamos por nome ou CNPJ. Se a organização já existir, informe o código de acesso
          ou solicite associação. Se não existir, abra o cadastro da nova organização.
        </p>
      </div>

      <OptionList
        label="Qual é seu vínculo?"
        items={organizationRelations.map((item) => ({
          value: item.value,
          label: item.label,
          description: item.description,
        }))}
        value={organizationRelation}
        onChange={(value) => form.setValue("organizationRelation", value as never, { shouldDirty: true })}
        columns={2}
      />

      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            label="Buscar por nome ou CNPJ"
            placeholder="Nome da empresa ou 00.000.000/0000-00"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="flex items-end">
            <Button type="button" onClick={searchOrganizations} disabled={isSearching}>
              <Search className="size-4" aria-hidden="true" />
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </div>

        {searchMessage ? (
          <p className="mt-3 text-sm leading-6 text-foreground-muted">{searchMessage}</p>
        ) : null}

        {results.length > 0 ? (
          <div className="mt-5 space-y-3">
            {results.map((organization) => {
              const selected = organizationId === organization.id;

              return (
                <button
                  key={organization.id}
                  type="button"
                  onClick={() => {
                    form.setValue("organizationFlow", "existing", { shouldDirty: true });
                    form.setValue("organizationId", organization.id, { shouldDirty: true });
                    form.setValue("organizationName", organization.legalName, { shouldDirty: true });
                    form.setValue("organizationCnpj", organization.cnpj ?? "", { shouldDirty: true });
                  }}
                  className={[
                    "w-full rounded-2xl border p-4 text-left transition hover:border-accent",
                    selected ? "border-accent bg-accent/10" : "border-border bg-surface",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-1 size-5 text-accent" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-foreground">{organization.legalName}</p>
                      <p className="mt-1 text-sm text-foreground-muted">
                        {organization.cnpj ? formatCnpj(organization.cnpj) : "CNPJ não informado"} ·{" "}
                        {organization.verificationStatus ?? "pendente"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.setValue("organizationFlow", "create", { shouldDirty: true });
              setIsCreateOpen(true);
            }}
          >
            Cadastrar nova organização
          </Button>
        </div>
      </div>

      {organizationId ? (
        <div className="rounded-2xl border border-border bg-background p-5">
          <Input
            label="Código de acesso da organização"
            placeholder="Informe o código fornecido pelo dono da organização"
            type="password"
            autoComplete="off"
            helperText="Se você não tiver código, a associação ficará pendente de aprovação."
            {...form.register("organizationAccessCode")}
          />
        </div>
      ) : null}

      {organizationRelation === "employee" && form.watch("organizationFlow") === "create" ? (
        <div className="rounded-2xl border border-emotion/30 bg-emotion/10 p-5 text-sm leading-6 text-foreground-secondary">
          Entraremos em contato para confirmar as informações.
        </div>
      ) : null}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-[9100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-5 shadow-irisLg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
                  Nova organização
                </p>
                <h3 className="mt-2 text-h3 font-semibold tracking-[-0.04em] text-foreground">
                  Cadastro institucional
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full border border-border p-2 text-foreground-muted hover:text-foreground"
                aria-label="Fechar popup"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input
                label="Nome da organização"
                placeholder="IRÍS Social"
                value={organizationName ?? ""}
                onChange={(event) => {
                  form.setValue("organizationFlow", "create", { shouldDirty: true });
                  form.setValue("organizationName", event.target.value, { shouldDirty: true });
                }}
              />

              <Input
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                value={organizationCnpj ?? ""}
                onChange={(event) => {
                  form.setValue("organizationCnpj", formatCnpj(event.target.value), { shouldDirty: true });
                }}
              />

              <Select
                label="Segmento"
                options={organizationSegments.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                {...form.register("organizationSegment")}
              />

              <Input
                label="CNPJ limpo"
                value={onlyDigits(organizationCnpj)}
                readOnly
                helperText="Este valor é usado apenas para busca/validação técnica."
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  form.setValue("organizationFlow", "create", { shouldDirty: true });
                  setIsCreateOpen(false);
                }}
              >
                Usar estes dados
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
