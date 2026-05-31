// web/src/errors/login/errors.ts
import { createIrisErrorMap } from "@/errors/core";

export const LOGIN_ERRORS = createIrisErrorMap({
  AUTH_INVALID_CREDENTIALS: {
    code: "IRIS_ERR_AUTH_001",
    scope: "login",
    severity: "warning",
    userMessage: {
      ptBR: "E-mail ou senha inválidos. Verifique os dados e tente novamente.",
      enUS: "Invalid email or password. Check your credentials and try again.",
    },
    technicalMessage: "Supabase Auth returned invalid login credentials.",
    possibleCause: "Senha incorreta, e-mail inexistente ou conta ainda não confirmada.",
    recoveryHint: "Validar credenciais, checar confirmação de e-mail e políticas do Supabase Auth.",
    shouldExposeToUser: true,
  },
  AUTH_SUPABASE_NOT_CONFIGURED: {
    code: "IRIS_ERR_AUTH_002",
    scope: "login",
    severity: "critical",
    userMessage: {
      ptBR: "Configuração de autenticação ausente. Verifique o ambiente do projeto.",
      enUS: "Authentication configuration is missing. Check the project environment.",
    },
    technicalMessage: "Supabase browser client could not be created.",
    possibleCause: "NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ausente/inválida.",
    recoveryHint: "Revisar web/.env.local e reiniciar o servidor Next.",
    shouldExposeToUser: true,
  },
  AUTH_NETWORK_FAILURE: {
    code: "IRIS_ERR_AUTH_003",
    scope: "login",
    severity: "error",
    userMessage: {
      ptBR: "Não foi possível acessar agora. Tente novamente em alguns instantes.",
      enUS: "Unable to sign in right now. Try again in a few moments.",
    },
    technicalMessage: "Unexpected network/runtime failure during sign in.",
    possibleCause: "Falha de rede, BD indisponível, CORS ou erro runtime no browser.",
    recoveryHint: "Verificar console, status do Supabase e conectividade.",
    shouldExposeToUser: true,
  },
  AUTH_REDIRECT_UNSAFE: {
    code: "IRIS_ERR_AUTH_004",
    scope: "login",
    severity: "warning",
    userMessage: {
      ptBR: "Redirecionamento inválido. Você será enviado para o painel padrão.",
      enUS: "Invalid redirect. You will be sent to the default dashboard.",
    },
    technicalMessage: "Unsafe redirectTo parameter blocked.",
    possibleCause: "URL externa, protocolo inválido ou tentativa de open redirect.",
    recoveryHint: "Permitir apenas caminhos internos iniciando com /.",
    shouldExposeToUser: false,
  },
  AUTH_FORM_VALIDATION: {
    code: "IRIS_ERR_AUTH_005",
    scope: "login",
    severity: "info",
    userMessage: {
      ptBR: "Revise os campos de e-mail e senha.",
      enUS: "Review email and password fields.",
    },
    technicalMessage: "Login form validation failed.",
    possibleCause: "E-mail inválido ou senha abaixo do mínimo.",
    recoveryHint: "Exibir erros campo a campo via Zod/React Hook Form.",
    shouldExposeToUser: true,
  },
} as const);

export type LoginErrorKey = keyof typeof LOGIN_ERRORS;
