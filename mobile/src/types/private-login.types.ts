// mobile/src/types/private-login.types.ts
export type PrivateLoginEntry = {
  slug: string;
  label: string;
  kind: string;
  relationship_label?: string | null;
};

export type PrivateLoginEntryPoints = {
  enabled: boolean;
  entries: PrivateLoginEntry[];
};

export type PrivateLoginQuizOption = {
  id: string;
  label: string;
  sort_order: number;
};

export type PrivateLoginQuizQuestion = {
  id: string;
  prompt: string;
  helper_text?: string | null;
  sort_order: number;
  options: PrivateLoginQuizOption[];
};

export type PrivateLoginQuizTarget = {
  slug: string;
  label: string;
  name: string;
  required_question_count: number;
  required_correct_answers: number;
};

export type PrivateLoginQuiz = {
  enabled: boolean;
  target: PrivateLoginQuizTarget | null;
  questions: PrivateLoginQuizQuestion[];
};

export type PrivateLoginAnswerPayload = {
  question_id: string;
  option_id: string;
};

export type VerifyPrivateLoginStepResult = {
  valid: boolean;
  correct: boolean;
  reason?: string;
};

export type PrivateAccessProfile = {
  target_id?: string;
  slug: string;
  label?: string | null;
  name?: string | null;
  full_name?: string | null;
  nickname?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  profile_payload?: Record<string, unknown>;
};

export type VerifyPrivateLoginResult = {
  granted: boolean;
  reason?: string;
  session_id?: string;
  success_route?: string;
  correct_count?: number;
  required_count?: number;
  profile?: PrivateAccessProfile;
};

export type PrivateAccessSession = {
  session_id: string;
  target_id?: string | null;
  slug: string;
  label?: string | null;
  name?: string | null;
  full_name?: string | null;
  nickname?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  success_route?: string | null;
  profile_payload?: Record<string, unknown>;
  granted_at?: string | null;
  expires_at?: string | null;
};

export type MyPrivateAccessResult = {
  authenticated: boolean;
  sessions: PrivateAccessSession[];
};