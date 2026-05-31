import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/config/env";
import { supabase } from "@/lib/supabase";
import {
  myPrivateAccessResultSchema,
  privateLoginEntryPointsSchema,
  privateLoginQuizSchema,
  verifyPrivateLoginResultSchema,
  verifyPrivateLoginStepResultSchema
} from "@/schemas/private-login.schemas";
import type {
  MyPrivateAccessResult,
  PrivateLoginAnswerPayload,
  PrivateLoginEntryPoints,
  PrivateLoginQuiz,
  VerifyPrivateLoginResult,
  VerifyPrivateLoginStepResult
} from "@/types/private-login.types";

class IrisPrivateLoginError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "SUPABASE_NOT_CONFIGURED"
      | "ANONYMOUS_AUTH_FAILED"
      | "ANONYMOUS_AUTH_DISABLED"
      | "RPC_FAILED"
      | "INVALID_RESPONSE"
  ) {
    super(message);
    this.name = "IrisPrivateLoginError";
  }
}

function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured || !supabase) {
    throw new IrisPrivateLoginError(
      "O Supabase ainda não está configurado.",
      "SUPABASE_NOT_CONFIGURED"
    );
  }

  return supabase;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return "unknown_error";
}

function isAnonymousAuthDisabled(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("anonymous sign-ins are disabled") ||
    message.includes("anonymous sign in is disabled") ||
    message.includes("anonymous provider is disabled")
  );
}

function logPrivateLoginWarning(scope: string, error: unknown): void {
  const message = getErrorMessage(error);
  console.warn("[IRIS_PRIVATE_LOGIN_" + scope + "]", { message });
}

export async function ensureAnonymousPrivateSession(): Promise<Session> {
  const client = getSupabaseClient();
  const currentSession = await client.auth.getSession();

  if (currentSession.error) {
    logPrivateLoginWarning("GET_SESSION_FAILED", currentSession.error);
  }

  if (currentSession.data.session) {
    return currentSession.data.session;
  }

  const { data, error } = await client.auth.signInAnonymously();

  if (error || !data.session) {
    if (isAnonymousAuthDisabled(error)) {
      logPrivateLoginWarning("ANONYMOUS_AUTH_DISABLED", error);

      throw new IrisPrivateLoginError(
        "Anonymous Sign-ins está desativado no Supabase.",
        "ANONYMOUS_AUTH_DISABLED"
      );
    }

    logPrivateLoginWarning("ANONYMOUS_AUTH_FAILED", error);

    throw new IrisPrivateLoginError(
      "Não foi possível abrir uma sessão privada.",
      "ANONYMOUS_AUTH_FAILED"
    );
  }

  return data.session;
}

export async function fetchPrivateLoginEntryPoints(): Promise<PrivateLoginEntryPoints> {
  const client = getSupabaseClient();
  const { data, error } = await client.rpc("get_private_login_entry_points");

  if (error) {
    logPrivateLoginWarning("ENTRY_POINTS_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível carregar as entradas.",
      "RPC_FAILED"
    );
  }

  const parsed = privateLoginEntryPointsSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginWarning("ENTRY_POINTS_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta de entradas veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function fetchPrivateLoginQuiz(
  targetSlug: string
): Promise<PrivateLoginQuiz> {
  const client = getSupabaseClient();

  const { data, error } = await client.rpc("get_private_login_quiz", {
    p_target_slug: targetSlug
  });

  if (error) {
    logPrivateLoginWarning("QUIZ_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível carregar o quiz.",
      "RPC_FAILED"
    );
  }

  const parsed = privateLoginQuizSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginWarning("QUIZ_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta do quiz veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function verifyPrivateLoginQuizStep(input: {
  targetSlug: string;
  questionId: string;
  optionId: string;
}): Promise<VerifyPrivateLoginStepResult> {
  const client = getSupabaseClient();

  try {
    await ensureAnonymousPrivateSession();
  } catch (error) {
    if (
      error instanceof IrisPrivateLoginError &&
      error.code === "ANONYMOUS_AUTH_DISABLED"
    ) {
      return {
        valid: false,
        correct: false,
        reason: "anonymous_disabled"
      };
    }

    throw error;
  }

  const { data, error } = await client.rpc("verify_private_login_quiz_step", {
    p_target_slug: input.targetSlug,
    p_question_id: input.questionId,
    p_option_id: input.optionId,
    p_device_label: "iris-mobile"
  });

  if (error) {
    logPrivateLoginWarning("VERIFY_STEP_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível verificar esta resposta.",
      "RPC_FAILED"
    );
  }

  const parsed = verifyPrivateLoginStepResultSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginWarning("VERIFY_STEP_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta de verificação por etapa veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function verifyPrivateLoginQuiz(input: {
  targetSlug: string;
  answers: PrivateLoginAnswerPayload[];
}): Promise<VerifyPrivateLoginResult> {
  const client = getSupabaseClient();

  try {
    await ensureAnonymousPrivateSession();
  } catch (error) {
    if (
      error instanceof IrisPrivateLoginError &&
      error.code === "ANONYMOUS_AUTH_DISABLED"
    ) {
      return {
        granted: false,
        reason: "anonymous_disabled"
      };
    }

    throw error;
  }

  const { data, error } = await client.rpc("verify_private_login_quiz", {
    p_target_slug: input.targetSlug,
    p_answers: input.answers,
    p_device_label: "iris-mobile"
  });

  if (error) {
    logPrivateLoginWarning("VERIFY_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível verificar as respostas.",
      "RPC_FAILED"
    );
  }

  const parsed = verifyPrivateLoginResultSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginWarning("VERIFY_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta de verificação veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function getMyPrivateAccess(): Promise<MyPrivateAccessResult> {
  const client = getSupabaseClient();
  const currentSession = await client.auth.getSession();

  if (!currentSession.data.session) {
    return {
      authenticated: false,
      sessions: []
    };
  }

  const { data, error } = await client.rpc("get_my_private_access");

  if (error) {
    logPrivateLoginWarning("MY_ACCESS_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível recuperar o acesso privado.",
      "RPC_FAILED"
    );
  }

  const parsed = myPrivateAccessResultSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginWarning("MY_ACCESS_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta de acesso privado veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function signOutPrivateSession(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase.auth.signOut({
    scope: "local"
  });

  if (error) {
    logPrivateLoginWarning("SIGN_OUT_FAILED", error);
  }
}
