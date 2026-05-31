// web/src/components/onboarding/onboarding-wizard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";

import { StepIndicator } from "@/components/onboarding/step-indicator";
import { StepAccountKind } from "@/components/onboarding/steps/step-account-kind";
import { StepAccountSummary } from "@/components/onboarding/steps/step-account-summary";
import { StepBotanicIdentity } from "@/components/onboarding/steps/step-botanic-identity";
import { StepEmail } from "@/components/onboarding/steps/step-email";
import { StepInternalCreationKey } from "@/components/onboarding/steps/step-internal-creation-key";
import {
  StepProfileAssets,
  type ProfileAssetDraft,
} from "@/components/onboarding/steps/step-profile-assets";
import { StepNotificationsOrContact } from "@/components/onboarding/steps/step-notifications-or-contact";
import { StepTeamOrOrganization } from "@/components/onboarding/steps/step-team-or-organization";
import { StepTour } from "@/components/onboarding/steps/step-tour";
import { StepUserProfile } from "@/components/onboarding/steps/step-user-profile";
import type { UsernameStatus } from "@/components/onboarding/types";
import {
  getAccountScopeFromEmail,
  getPasswordChecks,
  normalizeUsername,
} from "@/components/onboarding/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { REGISTER_ERRORS, getIrisUserMessage, logIrisError } from "@/errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  onboardingSchema,
  type OnboardingFormValues,
} from "@/schemas/onboarding.schema";

type OnboardingStepId =
  | "email"
  | "kind"
  | "internal-key"
  | "affiliation"
  | "communication"
  | "profile"
  | "flora"
  | "assets"
  | "summary"
  | "tour";

type StepDescriptor = {
  id: OnboardingStepId;
  label: string;
};

const defaultValues: OnboardingFormValues = {
  email: "",
  password: "",
  confirmPassword: "",
  accountScope: "external",
  internalRole: undefined,
  internalTeam: undefined,
  hasInternalCreationKey: false,
  internalCreationKey: "",
  externalAccountType: undefined,
  organizationFlow: "none",
  organizationId: undefined,
  organizationName: "",
  organizationCnpj: "",
  organizationSegment: undefined,
  organizationRelation: undefined,
  organizationAccessCode: "",
  businessPhone: "",
  businessPosition: undefined,
  notificationChannels: ["internal_email"],
  notificationFrequency: "daily_digest",
  notificationTopics: ["new_requests", "pending_approvals"],
  fullName: "",
  username: "",
  cpf: "",
  birthDate: "",
  cep: "",
  addressLine: "",
  addressNumber: "",
  addressComplement: "",
  neighborhood: "",
  city: "",
  state: "",
  botanicInclination: "NULO",
  profileBio: "",
  avatarPath: "",
  coverPath: "",
  avatarTransform: { cropX: 0, cropY: 0, zoom: 1 },
  coverTransform: { cropX: 0, cropY: 0, zoom: 1 },
  acceptedTerms: false,
  acceptedPartnerTerms: false,
  allowTour: true,
};

function removeSensitiveDraftFields(values: OnboardingFormValues) {
  return {
    ...values,
    password: "",
    confirmPassword: "",
    cpf: "",
    internalCreationKey: "",
    organizationAccessCode: "",
    avatarPath: "",
    coverPath: "",
  };
}

function getFileExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function uploadProfileAsset(params: {
  userId: string;
  file: File | null;
  kind: "avatar" | "cover";
}) {
  const { userId, file, kind } = params;

  if (!file) return "";

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("Formato de imagem não permitido.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Imagem maior que o limite de 5MB.");
  }

  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase não configurado para upload.");
  }

  const extension = getFileExtension(file);
  const assetPath = "users/" + userId + "/profile/" + kind + "." + extension;

  const { error } = await supabase.storage
    .from("iris-profile-assets")
    .upload(assetPath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return assetPath;
}

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>({
    state: "idle",
    message: "Escolha um @ único para o admin.",
  });
  const [completed, setCompleted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [diagnosticCode, setDiagnosticCode] = useState<string | null>(null);
  const [profileAssets, setProfileAssets] = useState<ProfileAssetDraft>({
    avatarFile: null,
    coverFile: null,
  });

  const form = useForm<OnboardingFormValues>({
    defaultValues,
    mode: "onChange",
  });

  const email = form.watch("email");
  const accountScope = form.watch("accountScope");
  const username = form.watch("username");
  const externalAccountType = form.watch("externalAccountType");

  const isPersonalExternal = accountScope === "external" && externalAccountType === "final_customer";

  const steps = useMemo<StepDescriptor[]>(() => {
    const sharedStart: StepDescriptor[] = [
      { id: "email", label: "E-mail" },
      { id: "kind", label: accountScope === "internal" ? "Função" : "Tipo" },
    ];

    const middle: StepDescriptor[] =
      accountScope === "internal"
        ? [
            { id: "internal-key", label: "Chave" },
            { id: "affiliation", label: "Time" },
            { id: "communication", label: "Avisos" },
          ]
        : isPersonalExternal
          ? []
          : [
              { id: "affiliation", label: "Organização" },
              { id: "communication", label: "Contato" },
            ];

    return [
      ...sharedStart,
      ...middle,
      { id: "profile", label: "Usuário" },
      { id: "flora", label: "Flora" },
      { id: "assets", label: "Perfil" },
      { id: "summary", label: "Resumo" },
      { id: "tour", label: "Tour" },
    ];
  }, [accountScope, isPersonalExternal]);

  const activeStep = steps[currentStep]?.id ?? "email";

  useEffect(() => {
    setCurrentStep((step) => Math.min(step, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    const scope = getAccountScopeFromEmail(email);
    form.setValue("accountScope", scope);

    if (scope === "internal") {
      form.setValue("externalAccountType", undefined);
    } else {
      form.setValue("internalRole", undefined);
      form.setValue("internalTeam", undefined);
      form.setValue("hasInternalCreationKey", false);
      form.setValue("internalCreationKey", "");
    }
  }, [email, form]);

  useEffect(() => {
    if (isPersonalExternal) {
      form.setValue("organizationFlow", "none");
      form.setValue("organizationId", undefined);
      form.setValue("organizationName", "");
      form.setValue("organizationCnpj", "");
      form.setValue("organizationRelation", undefined);
      form.setValue("organizationAccessCode", "");
      form.setValue("businessPosition", undefined);
      form.setValue("acceptedPartnerTerms", false);
    }
  }, [form, isPersonalExternal]);

  useEffect(() => {
    const rawDraft = window.localStorage.getItem("iris-admin-onboarding-draft");

    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft) as Partial<OnboardingFormValues> & {
        currentStep?: number;
      };

      Object.entries(draft).forEach(([key, value]) => {
        if (key === "currentStep") return;
        if (key === "password" || key === "confirmPassword" || key === "cpf") return;
        if (key === "internalCreationKey" || key === "organizationAccessCode") return;
        if (key === "avatarPath" || key === "coverPath") return;

        form.setValue(key as keyof OnboardingFormValues, value as never);
      });

      if (typeof draft.currentStep === "number") {
        setCurrentStep(Math.min(Math.max(draft.currentStep, 0), steps.length - 1));
      }
    } catch {
      window.localStorage.removeItem("iris-admin-onboarding-draft");
    }
  }, [form, steps.length]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      window.localStorage.setItem(
        "iris-admin-onboarding-draft",
        JSON.stringify({
          ...removeSensitiveDraftFields(values as OnboardingFormValues),
          currentStep,
        }),
      );
    });

    return () => subscription.unsubscribe();
  }, [form, currentStep]);

  useEffect(() => {
    const normalized = normalizeUsername(username);

    if (username !== normalized) {
      form.setValue("username", normalized);
      return;
    }

    if (normalized.length < 3) {
      setUsernameStatus({
        state: "idle",
        message: "Escolha um @ único para o admin.",
      });
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setUsernameStatus({
          state: "checking",
          message: "Verificando disponibilidade...",
        });

        const response = await fetch(
          "/api/onboarding/username/check?username=" + encodeURIComponent(normalized),
          { cache: "no-store" },
        );

        const payload = (await response.json()) as {
          available: boolean;
          checked: boolean;
          reason: string;
        };

        if (!payload.checked) {
          setUsernameStatus({
            state: "unknown",
            message: payload.reason,
          });
          return;
        }

        setUsernameStatus({
          state: payload.available ? "available" : "unavailable",
          message: payload.reason,
        });
      } catch (error) {
        const irisError = REGISTER_ERRORS.REGISTER_USERNAME_CHECK_FAILED;
        logIrisError(irisError, { route: "/register", action: "username_check" }, error);
        setUsernameStatus({
          state: "unknown",
          message: getIrisUserMessage(irisError),
        });
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [username, form]);

  function canGoNext(): boolean {
    const values = form.getValues();

    if (activeStep === "email") {
      const passwordChecks = getPasswordChecks(values.password, values.confirmPassword);
      return values.email.includes("@") && passwordChecks.every((check) => check.valid);
    }

    if (activeStep === "kind") {
      return accountScope === "internal"
        ? Boolean(values.internalRole)
        : Boolean(values.externalAccountType);
    }

    if (activeStep === "internal-key") {
      return !values.hasInternalCreationKey || Boolean(values.internalCreationKey?.trim());
    }

    if (activeStep === "affiliation") {
      if (accountScope === "internal") return Boolean(values.internalTeam);
      if (values.externalAccountType === "final_customer") return true;

      if (values.organizationFlow === "existing") return Boolean(values.organizationId);
      if (values.organizationFlow === "create") {
        return Boolean(values.organizationName?.trim()) && Boolean(values.organizationRelation);
      }

      return false;
    }

    if (activeStep === "communication") {
      return accountScope === "internal"
        ? values.notificationChannels.length > 0 && values.notificationTopics.length > 0
        : Boolean(values.businessPosition);
    }

    if (activeStep === "profile") {
      return (
        values.fullName.trim().length >= 3 &&
        values.username.trim().length >= 3 &&
        values.acceptedTerms &&
        (isPersonalExternal || accountScope === "internal" || Boolean(values.acceptedPartnerTerms))
      );
    }

    if (activeStep === "flora") {
      return Boolean(values.botanicInclination);
    }

    return true;
  }

  function goNext() {
    setFormError(null);

    if (!canGoNext()) {
      setFormError("Preencha os campos obrigatórios desta etapa antes de continuar.");
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function goBack() {
    setFormError(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function onSubmit(values: OnboardingFormValues) {
    setFormError(null);
    setSuccessMessage(null);
    setDiagnosticCode(null);

    const parsed = onboardingSchema.safeParse(values);

    if (!parsed.success) {
      const irisError = REGISTER_ERRORS.REGISTER_SCHEMA_REFINEMENT_FAILURE;
      logIrisError(
        irisError,
        { route: "/register", action: "zod_validation", metadata: parsed.error.flatten() },
      );
      setFormError(getIrisUserMessage(irisError));
      return;
    }

    if (usernameStatus.state === "unavailable") {
      const irisError = REGISTER_ERRORS.REGISTER_USERNAME_UNAVAILABLE;
      logIrisError(irisError, { route: "/register", action: "username_unavailable" });
      setFormError(getIrisUserMessage(irisError));
      return;
    }

    const supabase = createSupabaseBrowserClient({ persistSession: true });

    if (!supabase) {
      const irisError = REGISTER_ERRORS.REGISTER_SUPABASE_NOT_CONFIGURED;
      logIrisError(irisError, { route: "/register", action: "create_supabase_browser_client" });
      setFormError(getIrisUserMessage(irisError));
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      const irisError = REGISTER_ERRORS.REGISTER_SIGNUP_FAILED;
      logIrisError(
        irisError,
        { route: "/register", action: "auth_sign_up", email: parsed.data.email },
        error,
      );
      setFormError(getIrisUserMessage(irisError));
      return;
    }

    const session = data.session ?? (await supabase.auth.getSession()).data.session;

    if (!session?.access_token) {
      const irisError = REGISTER_ERRORS.REGISTER_SESSION_MISSING_AFTER_SIGNUP;
      logIrisError(irisError, { route: "/register", action: "signup_without_session" });
      setCompleted(true);
      setSuccessMessage(getIrisUserMessage(irisError));
      window.localStorage.removeItem("iris-admin-onboarding-draft");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? data.user?.id;

    if (!userId) {
      setFormError("Não foi possível confirmar o usuário autenticado para concluir o cadastro.");
      return;
    }

    try {
      const [avatarPath, coverPath] = await Promise.all([
        uploadProfileAsset({
          userId,
          file: profileAssets.avatarFile,
          kind: "avatar",
        }),
        uploadProfileAsset({
          userId,
          file: profileAssets.coverFile,
          kind: "cover",
        }),
      ]);

      const { password: _password, confirmPassword: _confirmPassword, ...payload } = {
        ...parsed.data,
        avatarPath,
        coverPath,
      };

      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.access_token,
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok: boolean;
        message?: string;
        redirectTo?: string;
        diagnosticCode?: string;
      };

      if (!response.ok || !result.ok) {
        const irisError = REGISTER_ERRORS.REGISTER_COMPLETE_API_FAILED;
        logIrisError(
          irisError,
          {
            route: "/register",
            action: "complete_onboarding",
            metadata: { status: response.status, message: result.message },
          },
        );
        setFormError(result.message ?? getIrisUserMessage(irisError));
        return;
      }

      window.localStorage.removeItem("iris-admin-onboarding-draft");
      setCompleted(true);
      setDiagnosticCode(result.diagnosticCode ?? null);
      setSuccessMessage("Cadastro concluído. Seu acesso foi criado com Botanic Identity.");
    } catch (error) {
      const irisError = REGISTER_ERRORS.REGISTER_COMPLETE_API_FAILED;
      logIrisError(irisError, { route: "/register", action: "profile_assets_or_complete" }, error);
      setFormError("Não foi possível concluir o cadastro com os dados visuais do perfil.");
    }
  }

  if (completed) {
    return (
      <div className="animate-[iris-soft-enter_360ms_ease-out] rounded-2xl border border-success/30 bg-success/10 p-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-success text-white">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>

        <h2 className="mt-5 text-h2 font-semibold tracking-[-0.04em] text-foreground">
          Acesso criado
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
          {successMessage}
        </p>

        {diagnosticCode ? (
          <div className="mt-5 rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
              Identificador de suporte
            </p>
            <p className="mt-2 break-all text-sm font-medium text-foreground">
              {diagnosticCode}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/login">Ir para login</ButtonLink>
          <ButtonLink href="/" variant="outline">Voltar ao início</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <StepIndicator steps={steps.map((step) => step.label)} currentStep={currentStep} />

      {formError ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-6 text-danger">
          {formError}
        </div>
      ) : null}

      {activeStep === "email" ? <StepEmail form={form} /> : null}
      {activeStep === "kind" ? <StepAccountKind form={form} /> : null}
      {activeStep === "internal-key" ? <StepInternalCreationKey form={form} /> : null}
      {activeStep === "affiliation" ? <StepTeamOrOrganization form={form} /> : null}
      {activeStep === "communication" ? <StepNotificationsOrContact form={form} /> : null}
      {activeStep === "profile" ? (
        <StepUserProfile
          form={form}
          usernameStatus={usernameStatus}
          setUsernameStatus={setUsernameStatus}
        />
      ) : null}
      {activeStep === "flora" ? <StepBotanicIdentity form={form} /> : null}
      {activeStep === "assets" ? (
        <StepProfileAssets
          form={form}
          profileAssets={profileAssets}
          setProfileAssets={setProfileAssets}
        />
      ) : null}
      {activeStep === "summary" ? <StepAccountSummary form={form} /> : null}
      {activeStep === "tour" ? <StepTour form={form} /> : null}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={currentStep === 0 || form.formState.isSubmitting}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button type="button" onClick={goNext}>
            Continuar
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Criando acesso...
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" aria-hidden="true" />
                Concluir onboarding
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-center text-xs leading-5 text-foreground-muted">
        O fluxo não redireciona automaticamente após criar a conta.
      </p>
    </form>
  );
}
