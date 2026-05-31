export type OfficialOnboardingStatus = {
  authenticated: boolean;
  completed: boolean;
  profile: {
    id: string;
    user_id: string;
    email: string;
    full_name: string;
    nickname?: string | null;
    username?: string | null;
    birth_date: string;
    age_years: number;
    is_minor: boolean;
    city: string;
    state_code?: string | null;
    country_code: string;
    species_code: string;
    stage_code: string;
    inclination_code: string;
    onboarding_status: string;
    completed_at?: string | null;
  } | null;
};

export type CompleteOfficialOnboardingInput = {
  email: string;
  fullName: string;
  nickname: string;
  username: string;
  birthDate: string;
  city: string;
  stateCode: string;
  countryCode: string;
  privateTargetSlug: string;
};

export type CompleteOfficialOnboardingResult = {
  completed: boolean;
  reason?: string;
  profile_id?: string;
  is_minor?: boolean;
  age_years?: number;
  success_route?: string;
};
