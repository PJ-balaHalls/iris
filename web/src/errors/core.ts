// web/src/errors/core.ts
export type IrisErrorScope = "login" | "register" | "onboarding" | "system";

export type IrisErrorSeverity = "info" | "warning" | "error" | "critical";

export type IrisErrorTranslation = {
  ptBR: string;
  enUS: string;
};

export type IrisErrorDefinition = {
  code: string;
  scope: IrisErrorScope;
  severity: IrisErrorSeverity;
  userMessage: IrisErrorTranslation;
  technicalMessage: string;
  possibleCause: string;
  recoveryHint: string;
  shouldExposeToUser: boolean;
};

export type IrisErrorLogContext = {
  route?: string;
  action?: string;
  userId?: string;
  email?: string;
  metadata?: Record<string, unknown>;
};

export function createIrisErrorMap<const T extends Record<string, IrisErrorDefinition>>(
  definitions: T,
) {
  return definitions;
}

export function getIrisUserMessage(error: IrisErrorDefinition, locale: "ptBR" | "enUS" = "ptBR") {
  return error.userMessage[locale];
}

export function logIrisError(
  error: IrisErrorDefinition,
  context: IrisErrorLogContext = {},
  originalError?: unknown,
) {
  const safeContext = {
    ...context,
    email: context.email ? "[redacted-email]" : undefined,
  };

  console.error("[IRIS_ERROR]", {
    code: error.code,
    scope: error.scope,
    severity: error.severity,
    technicalMessage: error.technicalMessage,
    possibleCause: error.possibleCause,
    recoveryHint: error.recoveryHint,
    context: safeContext,
    originalError:
      originalError instanceof Error
        ? {
            name: originalError.name,
            message: originalError.message,
            stack: originalError.stack,
          }
        : originalError
          ? String(originalError)
          : undefined,
  });
}
