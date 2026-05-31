import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { router, useLocalSearchParams } from "expo-router";
import {
  Check,
  ChevronLeft,
  Mail,
  MapPin,
  ShieldCheck,
  Sprout
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthResponsiveShell } from "@/components/auth/AuthResponsiveShell";
import { AuthTranslucentPanel } from "@/components/auth/AuthTranslucentPanel";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingStepHeader } from "@/components/onboarding/OnboardingStepHeader";
import { IrisButton } from "@/components/ui/IrisButton";
import { IrisTextInput } from "@/components/ui/IrisTextInput";
import {
  officialAccountStepSchema,
  officialPersonalStepSchema,
  officialProfileStepSchema
} from "@/schemas/official-onboarding.schemas";
import {
  completeOfficialOnboarding,
  convertAnonymousSessionToOfficialAccount,
  getMyOfficialOnboardingStatus,
  signInOfficialAccount
} from "@/services/official-onboarding.service";

type Step = 1 | 2 | 3 | 4;
type FieldErrors = Record<string, string | null>;

export default function OfficialOnboardingScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();

  const privateTargetSlug = Array.isArray(params.slug)
    ? params.slug[0] ?? "isabela"
    : params.slug ?? "isabela";

  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [countryCode] = useState("BRA");

  const statusQuery = useQuery({
    queryKey: ["official-onboarding-status"],
    queryFn: getMyOfficialOnboardingStatus
  });

  useEffect(() => {
    if (statusQuery.data?.completed) {
      router.replace("/home" as Href);
    }
  }, [statusQuery.data?.completed]);

  const accountMutation = useMutation({
    mutationFn: () =>
      convertAnonymousSessionToOfficialAccount({
        email,
        password,
        fullName: fullName || nickname || "IRIS"
      }),
    onSuccess: (result) => {
      setNotice(
        result.emailConfirmationRequired
          ? "Enviamos a confirmação para o e-mail. Confirme e toque em “Já confirmei”."
          : "Conta oficial criada. Vamos continuar."
      );
      setStep(2);
    },
    onError: () => {
      setNotice("Não consegui criar a conta oficial. Verifique o e-mail e tente novamente.");
    }
  });

  const signInMutation = useMutation({
    mutationFn: () => signInOfficialAccount({ email, password }),
    onSuccess: () => {
      setNotice("E-mail confirmado. Agora vamos finalizar seu perfil.");
      setStep(3);
    },
    onError: () => {
      setNotice("Ainda não consegui entrar. Confirme o e-mail e tente novamente.");
    }
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      completeOfficialOnboarding({
        email,
        fullName,
        nickname,
        username,
        birthDate,
        city,
        stateCode,
        countryCode,
        privateTargetSlug
      }),
    onSuccess: (result) => {
      if (!result.completed) {
        setNotice(
          result.reason === "minimum_age"
            ? "Essa idade exige uma conta Kids. Vamos tratar esse fluxo depois."
            : "Não consegui concluir o onboarding oficial."
        );
        return;
      }

      router.replace("/home" as Href);
    },
    onError: () => {
      setNotice("Não consegui concluir o onboarding oficial agora.");
    }
  });

  const agePreview = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;

    const birth = new Date(birthDate + "T00:00:00");
    const now = new Date();

    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age -= 1;
    }

    if (!Number.isFinite(age)) return null;
    return age;
  }, [birthDate]);

  function normalizeUsername(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 24);
  }

  function validateAccount() {
    const parsed = officialAccountStepSchema.safeParse({ email, password });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors({
        email: flattened.email?.[0] ?? null,
        password: flattened.password?.[0] ?? null
      });
      return false;
    }

    setErrors({});
    return true;
  }

  function validateProfile() {
    const parsed = officialProfileStepSchema.safeParse({
      fullName,
      nickname,
      username
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors({
        fullName: flattened.fullName?.[0] ?? null,
        nickname: flattened.nickname?.[0] ?? null,
        username: flattened.username?.[0] ?? null
      });
      return false;
    }

    setErrors({});
    return true;
  }

  function validatePersonal() {
    const parsed = officialPersonalStepSchema.safeParse({
      birthDate,
      city,
      stateCode,
      countryCode
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors({
        birthDate: flattened.birthDate?.[0] ?? null,
        city: flattened.city?.[0] ?? null,
        stateCode: flattened.stateCode?.[0] ?? null
      });
      return false;
    }

    setErrors({});
    return true;
  }

  function handleNext() {
    setNotice(null);

    if (step === 1) {
      if (!validateAccount()) return;
      accountMutation.mutate();
      return;
    }

    if (step === 2) {
      signInMutation.mutate();
      return;
    }

    if (step === 3) {
      if (!validateProfile()) return;
      setStep(4);
      return;
    }

    if (step === 4) {
      if (!validatePersonal()) return;
      completeMutation.mutate();
    }
  }

  function handleBack() {
    setNotice(null);

    if (step > 1) {
      setStep((current) => (current - 1) as Step);
      return;
    }

    router.back();
  }

  function getButtonLabel() {
    if (accountMutation.isPending) return "Criando conta...";
    if (signInMutation.isPending) return "Verificando...";
    if (completeMutation.isPending) return "Finalizando...";

    if (step === 1) return "Criar conta oficial";
    if (step === 2) return "Já confirmei";
    if (step === 3) return "Continuar";
    return "Concluir onboarding";
  }

  const loading =
    accountMutation.isPending ||
    signInMutation.isPending ||
    completeMutation.isPending;

  return (
    <AuthResponsiveShell>
      {({ isTablet }) => (
        <View
          className={
            isTablet
              ? "min-h-[680px] flex-row items-center justify-between gap-14"
              : "gap-8"
          }
        >
          <View className={isTablet ? "flex-1" : undefined}>
            <Pressable
              accessibilityRole="button"
              onPress={handleBack}
              className="mb-8 h-11 w-11 items-center justify-center rounded-full bg-[#FAF7F2]/70"
            >
              <ChevronLeft size={24} color="#111111" />
            </Pressable>

            <OnboardingProgress current={step} total={4} />

            <View className="mt-10">
              {step === 1 ? (
                <OnboardingStepHeader
                  eyebrow="primeiro acesso"
                  title="Agora vamos criar sua conta oficial."
                  description="O quiz abriu a porta privada. Agora o IRIS precisa transformar este acesso em uma conta real, segura e recuperável."
                />
              ) : null}

              {step === 2 ? (
                <OnboardingStepHeader
                  eyebrow="confirmação"
                  title="Confirme seu e-mail."
                  description="Abra sua caixa de entrada, confirme o e-mail do Supabase/IRIS e volte para continuar."
                />
              ) : null}

              {step === 3 ? (
                <OnboardingStepHeader
                  eyebrow="identidade"
                  title="Como a IRIS deve chamar você?"
                  description="Essas informações formam a base do seu Account Profile dentro do ecossistema."
                />
              ) : null}

              {step === 4 ? (
                <OnboardingStepHeader
                  eyebrow="flora"
                  title="Sua Flora inicial."
                  description="Cidade, idade e estágio inicial ajudam a IRIS criar sua primeira identidade botânica oficial."
                />
              ) : null}
            </View>

            {agePreview !== null ? (
              <View className="mt-8 rounded-[28px] border border-border/80 bg-[#FAF7F2]/55 px-5 py-4">
                <Text className="text-caption font-semibold text-foreground">
                  Idade detectada: {agePreview} anos
                </Text>
                <Text className="mt-1 text-detail leading-5 text-foreground-muted">
                  {agePreview < 18
                    ? "Esse perfil será tratado futuramente como conta Kids/menor."
                    : "Esse perfil segue como conta adulta comum."}
                </Text>
              </View>
            ) : null}
          </View>

          <View className={isTablet ? "flex-1" : undefined}>
            <AuthTranslucentPanel intense>
              {step === 1 ? (
                <View className="gap-5">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-foreground">
                    <Mail size={20} color="#FFFFFF" />
                  </View>

                  <IrisTextInput
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="isabela@email.com"
                    error={errors.email}
                  />

                  <IrisTextInput
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="mínimo 8 caracteres"
                    error={errors.password}
                  />
                </View>
              ) : null}

              {step === 2 ? (
                <View className="gap-5">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-foreground">
                    <ShieldCheck size={20} color="#FFFFFF" />
                  </View>

                  <Text className="text-[25px] leading-[31px] tracking-[-0.8px] text-foreground">
                    Depois de confirmar, volte aqui.
                  </Text>

                  <Text className="text-caption leading-6 text-foreground-muted">
                    Vamos tentar entrar com seu e-mail e senha. Se a confirmação
                    ainda não tiver sido feita, a IRIS vai pedir para aguardar.
                  </Text>
                </View>
              ) : null}

              {step === 3 ? (
                <View className="gap-5">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-foreground">
                    <Check size={20} color="#FFFFFF" />
                  </View>

                  <IrisTextInput
                    label="Nome completo"
                    value={fullName}
                    onChangeText={(value) => {
                      setFullName(value);
                      if (!username) {
                        setUsername(normalizeUsername(value.split(" ")[0] ?? ""));
                      }
                    }}
                    placeholder="Isabela Vaz"
                    error={errors.fullName}
                  />

                  <IrisTextInput
                    label="Apelido"
                    value={nickname}
                    onChangeText={setNickname}
                    placeholder="Isa"
                    error={errors.nickname}
                  />

                  <IrisTextInput
                    label="Usuário"
                    value={username}
                    onChangeText={(value) => setUsername(normalizeUsername(value))}
                    autoCapitalize="none"
                    placeholder="isabela"
                    error={errors.username}
                  />
                </View>
              ) : null}

              {step === 4 ? (
                <View className="gap-5">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-foreground">
                    <Sprout size={20} color="#FFFFFF" />
                  </View>

                  <IrisTextInput
                    label="Nascimento"
                    value={birthDate}
                    onChangeText={setBirthDate}
                    placeholder="AAAA-MM-DD"
                    keyboardType="numbers-and-punctuation"
                    error={errors.birthDate}
                  />

                  <IrisTextInput
                    label="Cidade"
                    value={city}
                    onChangeText={setCity}
                    placeholder="São Paulo"
                    error={errors.city}
                  />

                  <IrisTextInput
                    label="UF"
                    value={stateCode}
                    onChangeText={(value) => setStateCode(value.toUpperCase().slice(0, 2))}
                    placeholder="SP"
                    autoCapitalize="characters"
                    error={errors.stateCode}
                  />

                  <View className="rounded-[24px] border border-border/80 bg-background/45 px-4 py-4">
                    <View className="flex-row items-center gap-3">
                      <MapPin size={18} color="#111111" />
                      <Text className="flex-1 text-caption leading-5 text-foreground-muted">
                        Flora inicial: IRIS_PARTNER • SEMENTE • NULO
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {notice ? (
                <View className="mt-6 rounded-[24px] border border-border/80 bg-background/55 px-4 py-4">
                  <Text className="text-caption leading-6 text-foreground-muted">
                    {notice}
                  </Text>
                </View>
              ) : null}

              <View className="mt-7">
                <IrisButton
                  label={getButtonLabel()}
                  loading={loading}
                  disabled={loading}
                  onPress={handleNext}
                />

                <Text className="mt-4 text-center text-detail leading-5 text-foreground-muted">
                  Este processo cria Account e Flora inicial no banco.
                </Text>
              </View>
            </AuthTranslucentPanel>
          </View>
        </View>
      )}
    </AuthResponsiveShell>
  );
}
