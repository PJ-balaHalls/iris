// mobile/app/(auth)/private-login/[slug].tsx
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Check,
  ChevronLeft,
  Heart,
  Lock,
  Sparkles,
  X
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  type ViewProps,
  type DimensionValue
} from "react-native";

import { IrisButton } from "@/components/ui/IrisButton";
import { IrisQuietCard } from "@/components/ui/IrisQuietCard";
import { IrisScreen } from "@/components/ui/IrisScreen";
import { authCopy } from "@/constants/auth-copy";
import {
  fetchPrivateLoginQuiz,
  verifyPrivateLoginQuiz,
  verifyPrivateLoginQuizStep
} from "@/services/private-login.service";
import { usePrivateAccessStore } from "@/stores/private-access.store";
import type {
  PrivateAccessSession,
  PrivateLoginAnswerPayload,
  PrivateLoginQuizQuestion
} from "@/types/private-login.types";
import { cn } from "@/utils/cn";
import { normalizePrivateSuccessRoute } from "@/utils/routes";

type QuestionFeedback = {
  status: "correct" | "wrong";
  message: string;
};

type FadeInViewProps = ViewProps & {
  delay?: number;
  distance?: number;
};

function FadeInView({
  children,
  delay = 0,
  distance = 12,
  style,
  ...props
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();
  }, [delay, distance, opacity, translateY]);

  return (
    <Animated.View
      {...props}
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

function getFailureMessage(reason: string | undefined): string {
  if (reason === "too_many_attempts") {
    return authCopy.quizRateLimit;
  }

  if (reason === "unauthenticated" || reason === "anonymous_disabled") {
    return authCopy.anonymousMissing;
  }

  return authCopy.quizFailure;
}

function buildAccessSession(input: {
  slug: string;
  resultProfile: NonNullable<
    Awaited<ReturnType<typeof verifyPrivateLoginQuiz>>["profile"]
  >;
  sessionId: string;
  successRoute: string;
}): PrivateAccessSession {
  return {
    session_id: input.sessionId,
    target_id: input.resultProfile.target_id,
    slug: input.resultProfile.slug ?? input.slug,
    label: input.resultProfile.label,
    name: input.resultProfile.name,
    full_name: input.resultProfile.full_name,
    nickname: input.resultProfile.nickname,
    email: input.resultProfile.email,
    avatar_url: input.resultProfile.avatar_url,
    success_route: input.successRoute,
    profile_payload: input.resultProfile.profile_payload ?? {},
    granted_at: new Date().toISOString(),
    expires_at: null
  };
}

function QuizOption({
  label,
  selected,
  locked,
  feedbackStatus,
  onPress
}: {
  label: string;
  selected: boolean;
  locked: boolean;
  feedbackStatus?: "correct" | "wrong";
  onPress: () => void;
}) {
  const isCorrect = selected && feedbackStatus === "correct";
  const isWrong = selected && feedbackStatus === "wrong";
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isWrong) return;

    Animated.sequence([
      Animated.timing(shake, {
        toValue: -4,
        duration: 55,
        useNativeDriver: true
      }),
      Animated.timing(shake, {
        toValue: 4,
        duration: 55,
        useNativeDriver: true
      }),
      Animated.timing(shake, {
        toValue: -2,
        duration: 55,
        useNativeDriver: true
      }),
      Animated.timing(shake, {
        toValue: 0,
        duration: 55,
        useNativeDriver: true
      })
    ]).start();
  }, [isWrong, shake]);

  return (
    <Animated.View
      style={{
        transform: [
          {
            scale: selected ? 1.012 : 1
          },
          {
            translateX: shake
          }
        ]
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        disabled={locked}
        onPress={onPress}
        className={cn(
          "min-h-[66px] justify-center rounded-[22px] border px-4 py-4",
          selected && "border-foreground bg-foreground",
          !selected && "border-border bg-surface",
          isCorrect && "border-success bg-success",
          isWrong && "border-danger bg-danger"
        )}
      >
        <View className="flex-row items-center gap-3">
          <View
            className={cn(
              "h-7 w-7 items-center justify-center rounded-full border",
              selected ? "border-white/40" : "border-border bg-background"
            )}
          >
            {isCorrect ? (
              <Check size={15} color="#FFFFFF" />
            ) : isWrong ? (
              <X size={15} color="#FFFFFF" />
            ) : selected ? (
              <View className="h-2.5 w-2.5 rounded-full bg-white" />
            ) : null}
          </View>

          <Text
            className={cn(
              "flex-1 text-[15px] leading-6",
              selected ? "font-semibold text-white" : "text-foreground"
            )}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function QuestionStep({
  question,
  selectedOptionId,
  feedback,
  locked,
  onSelect
}: {
  question: PrivateLoginQuizQuestion;
  selectedOptionId: string | undefined;
  feedback: QuestionFeedback | undefined;
  locked: boolean;
  onSelect: (optionId: string) => void;
}) {
  return (
    <View>
      <FadeInView key={`title-${question.id}`} delay={0} distance={18}>
        <Text className="text-[32px] leading-[38px] tracking-[-1.25px] text-foreground">
          {question.prompt}
        </Text>

        {question.helper_text ? (
          <Text className="mt-4 text-body leading-7 text-foreground-muted">
            {question.helper_text}
          </Text>
        ) : null}
      </FadeInView>

      <View className="mt-8 gap-3">
        {question.options.map((option, index) => (
          <FadeInView
            key={option.id}
            delay={80 + index * 50}
            distance={10}
          >
            <QuizOption
              label={option.label}
              selected={selectedOptionId === option.id}
              locked={locked}
              feedbackStatus={feedback?.status}
              onPress={() => onSelect(option.id)}
            />
          </FadeInView>
        ))}
      </View>
    </View>
  );
}

function FeedbackPanel({ feedback }: { feedback: QuestionFeedback }) {
  const isCorrect = feedback.status === "correct";

  return (
    <FadeInView delay={0} distance={12}>
      <View
        className={cn(
          "mt-6 rounded-[26px] border px-5 py-5",
          isCorrect
            ? "border-success/30 bg-[#EDF7F2]"
            : "border-danger/30 bg-[#FFF0EE]"
        )}
      >
        <View className="flex-row items-start gap-3">
          <View
            className={cn(
              "h-9 w-9 items-center justify-center rounded-full",
              isCorrect ? "bg-success" : "bg-danger"
            )}
          >
            {isCorrect ? (
              <Check size={17} color="#FFFFFF" />
            ) : (
              <X size={17} color="#FFFFFF" />
            )}
          </View>

          <View className="flex-1">
            <Text className="text-caption font-semibold text-foreground">
              {isCorrect ? "Certo." : "Ainda não."}
            </Text>

            <Text className="mt-1 text-caption leading-5 text-foreground-muted">
              {feedback.message}
            </Text>
          </View>
        </View>
      </View>
    </FadeInView>
  );
}

export default function PrivateLoginQuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const setActiveAccess = usePrivateAccessStore(
    (state) => state.setActiveAccess
  );

  const slug = Array.isArray(params.slug)
    ? params.slug[0] ?? "isabela"
    : params.slug ?? "isabela";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {}
  );
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<
    Record<string, QuestionFeedback>
  >({});
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["private-login-quiz", slug],
    queryFn: () => fetchPrivateLoginQuiz(slug),
    enabled: slug.length > 0
  });

  const questions = query.data?.questions ?? [];
  const target = query.data?.target ?? null;
  const currentQuestion = questions[currentIndex];

  const selectedCount = useMemo(
    () =>
      questions.filter(
        (question) => feedbackByQuestion[question.id]?.status === "correct"
      ).length,
    [questions, feedbackByQuestion]
  );

  const progressLabel = questions.length
    ? `${selectedCount}/${questions.length}`
    : "0/3";

  const progressPercent = questions.length
    ? Math.max(8, (selectedCount / questions.length) * 100)
    : 8;

  const progressWidth = `${progressPercent}%` as DimensionValue;

  const currentFeedback = currentQuestion
    ? feedbackByQuestion[currentQuestion.id]
    : undefined;

  const selectedCurrentOption = currentQuestion
    ? selectedAnswers[currentQuestion.id]
    : undefined;

  const stepMutation = useMutation({
    mutationFn: (input: { questionId: string; optionId: string }) =>
      verifyPrivateLoginQuizStep({
        targetSlug: slug,
        questionId: input.questionId,
        optionId: input.optionId
      }),
    onSuccess: (result) => {
      if (!currentQuestion) return;

      if (!result.valid) {
        setFailureMessage(getFailureMessage(result.reason));
        return;
      }

      setFailureMessage(null);

      setFeedbackByQuestion((current) => ({
        ...current,
        [currentQuestion.id]: result.correct
          ? {
              status: "correct",
              message:
                "Essa lembrança abriu. A IRIS guardou essa resposta com cuidado."
            }
          : {
              status: "wrong",
              message:
                "Não foi essa. Tenta sentir a memória antes de responder de novo."
            }
      }));
    },
    onError: () => {
      setFailureMessage("Não consegui verificar esta resposta agora.");
    }
  });

  const finalMutation = useMutation({
    mutationFn: (answers: PrivateLoginAnswerPayload[]) =>
      verifyPrivateLoginQuiz({
        targetSlug: slug,
        answers
      }),
    onSuccess: (result) => {
      if (!result.granted || !result.profile || !result.session_id) {
        setFailureMessage(getFailureMessage(result.reason));
        return;
      }

      const successRoute = result.success_route ?? "/home";

      setActiveAccess(
        buildAccessSession({
          slug,
          resultProfile: result.profile,
          sessionId: result.session_id,
          successRoute
        })
      );

      router.replace("/official-onboarding" as never);
    },
    onError: () => {
      setFailureMessage(authCopy.quizFailure);
    }
  });

  const canConfirm =
    Boolean(currentQuestion) &&
    Boolean(selectedCurrentOption) &&
    !currentFeedback &&
    !stepMutation.isPending &&
    !finalMutation.isPending;

  const canGoNext = currentFeedback?.status === "correct";
  const canRetry = currentFeedback?.status === "wrong";

  function handleSelect(optionId: string) {
    if (!currentQuestion || stepMutation.isPending || finalMutation.isPending) {
      return;
    }

    setFailureMessage(null);
    setSelectedAnswers((current) => ({
      ...current,
      [currentQuestion.id]: optionId
    }));
  }

  function buildPayload(): PrivateLoginAnswerPayload[] {
    return questions.flatMap((question) => {
      const optionId = selectedAnswers[question.id];

      if (!optionId) return [];

      return [
        {
          question_id: question.id,
          option_id: optionId
        }
      ];
    });
  }

  function handlePrimaryAction() {
    if (!currentQuestion) return;

    if (canRetry) {
      setSelectedAnswers((current) => {
        const next = { ...current };
        delete next[currentQuestion.id];
        return next;
      });

      setFeedbackByQuestion((current) => {
        const next = { ...current };
        delete next[currentQuestion.id];
        return next;
      });

      return;
    }

    if (canGoNext) {
      const isLast = currentIndex >= questions.length - 1;

      if (!isLast) {
        setCurrentIndex((value) => value + 1);
        return;
      }

      finalMutation.mutate(buildPayload());
      return;
    }

    if (!selectedCurrentOption) return;

    stepMutation.mutate({
      questionId: currentQuestion.id,
      optionId: selectedCurrentOption
    });
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((value) => value - 1);
      return;
    }

    router.back();
  }

  function getPrimaryLabel() {
    if (finalMutation.isPending) return "Abrindo...";
    if (stepMutation.isPending) return "Verificando...";
    if (canRetry) return "Tentar outra resposta";

    if (canGoNext && currentIndex >= questions.length - 1) {
      return "Abrir nosso espaço";
    }

    if (canGoNext) return "Próxima lembrança";

    return "Confirmar resposta";
  }

  if (query.isLoading) {
    return (
      <IrisScreen scroll={false}>
        <View className="flex-1 justify-center">
          <Text className="text-[34px] leading-[40px] tracking-[-1.2px] text-foreground">
            A IRIS está preparando as perguntas.
          </Text>

          <View className="mt-10 gap-3">
            <View className="h-16 rounded-2xl border border-border bg-surface opacity-60" />
            <View className="ml-6 h-16 rounded-2xl border border-border bg-surface opacity-40" />
            <View className="h-16 rounded-2xl border border-border bg-surface opacity-30" />
          </View>
        </View>
      </IrisScreen>
    );
  }

  if (query.error || !target || !currentQuestion) {
    return (
      <IrisScreen>
        <View className="min-h-full justify-center">
          <IrisQuietCard>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-foreground">
              <Lock size={18} color="#FFFFFF" />
            </View>

            <Text className="mt-6 text-[30px] leading-[36px] tracking-[-1.1px] text-foreground">
              Não consegui abrir esse caminho.
            </Text>

            <Text className="mt-4 text-body leading-7 text-foreground-muted">
              Verifique se o quiz está ativo no banco e se existem exatamente 3
              perguntas com 3 alternativas cada.
            </Text>

            <IrisButton
              className="mt-8"
              label="Voltar"
              variant="secondary"
              onPress={() => router.back()}
            />
          </IrisQuietCard>
        </View>
      </IrisScreen>
    );
  }

  return (
    <IrisScreen scroll={false}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-full bg-transparent"
          >
            <ChevronLeft size={23} color="#111111" />
          </Pressable>

          <Text className="text-detail font-semibold text-foreground-muted">
            {progressLabel} abertas
          </Text>
        </View>

        <View className="mt-5 h-[3px] overflow-hidden rounded-full bg-border">
          <View
            className="h-full rounded-full bg-foreground"
            style={{ width: progressWidth }}
          />
        </View>

        <View className="mt-8">
          <FadeInView delay={0} distance={10}>
            <View className="mb-7 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface">
                {currentIndex === 0 ? (
                  <Sparkles size={16} color="#111111" />
                ) : (
                  <Heart size={16} color="#111111" />
                )}
              </View>

              <Text className="flex-1 text-caption leading-5 text-foreground-muted">
                Responda, confirme e espere a IRIS reconhecer a lembrança antes
                de seguir.
              </Text>
            </View>
          </FadeInView>

          <QuestionStep
            question={currentQuestion}
            selectedOptionId={selectedCurrentOption}
            feedback={currentFeedback}
            locked={Boolean(currentFeedback)}
            onSelect={handleSelect}
          />
        </View>

        {currentFeedback ? <FeedbackPanel feedback={currentFeedback} /> : null}

        {failureMessage ? (
          <IrisQuietCard className="mt-5 border-danger/40">
            <Text className="text-caption leading-5 text-foreground">
              {failureMessage}
            </Text>
          </IrisQuietCard>
        ) : null}

        <View className="mt-auto pt-6">
          <IrisButton
            label={getPrimaryLabel()}
            disabled={!canConfirm && !canGoNext && !canRetry}
            loading={stepMutation.isPending || finalMutation.isPending}
            onPress={handlePrimaryAction}
          />

          <Text className="mt-5 text-center text-detail leading-5 text-foreground-muted">
            O app nunca recebe a resposta correta. Ele só pergunta ao banco se a
            memória abriu.
          </Text>
        </View>
      </View>
    </IrisScreen>
  );
}