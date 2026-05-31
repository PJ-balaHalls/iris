// /web/src/types/admin.ts
export type AdminProfileView = {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  username: string | null;
  accountScope: string | null;
  internalRole: string | null;
  internalTeam: string | null;
  onboardingStatus: string | null;
  isActive: boolean;
  botanicIdentityId: string | null;
};

export type EcosystemProfileView = {
  id: string;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  avatarPath: string | null;
  coverPath: string | null;
  profileStatus: string | null;
};

export type BotanicIdentityView = {
  id: string;
  userId: string;
  profileId: string | null;
  speciesCode: string | null;
  stageCode: string | null;
  inclinationCode: string | null;
  accountPrefix: string | null;
  accountNumber: number | null;
  regionCode: string | null;
  countryCode: string | null;
  diagnosticCode: string | null;
  governanceRoleCode: string | null;
  rootGovernanceEnabled: boolean;
  identityStatus: string | null;
};

export type AdminAccessView = {
  isRootGovernance: boolean;
  isEngineering: boolean;
  isModerator: boolean;
  canUseAdmin: boolean;
  label: string;
};

export type AdminLayoutContext = {
  user: {
    id: string;
    email: string;
  };
  profile: AdminProfileView;
  ecosystemProfile: EcosystemProfileView | null;
  identity: BotanicIdentityView;
  access: AdminAccessView;
  pendingAlerts: number;
};

export type AdminLayoutResult =
  | { status: "ok"; context: AdminLayoutContext }
  | { status: "unauthenticated" }
  | { status: "forbidden" };

export type DashboardMetric = {
  label: string;
  value: string;
  description: string;
  state: "available" | "restricted" | "warning";
};

export type DashboardSnapshot = {
  metrics: DashboardMetric[];
  generatedAt: string;
};
