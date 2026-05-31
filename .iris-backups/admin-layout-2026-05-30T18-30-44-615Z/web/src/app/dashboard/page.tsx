// web/src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import {
  DashboardShell,
  type AdminDashboardProfile
} from "@/components/admin/dashboard-shell";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AdminProfileRow = {
  email: string;
  full_name: string | null;
  username: string | null;
  account_scope: "internal" | "external";
  internal_role: string | null;
  internal_team: string | null;
  external_account_type: string | null;
  onboarding_status: "draft" | "completed";
  is_active: boolean;
};

function mapProfile(row: AdminProfileRow): AdminDashboardProfile {
  return {
    email: row.email,
    fullName: row.full_name,
    username: row.username,
    accountScope: row.account_scope,
    internalRole: row.internal_role,
    internalTeam: row.internal_team,
    externalAccountType: row.external_account_type
  };
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerComponentClient();

  if (!supabase) {
    redirect("/login?reason=auth_config");
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?redirectTo=%2Fdashboard");
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select(
      [
        "email",
        "full_name",
        "username",
        "account_scope",
        "internal_role",
        "internal_team",
        "external_account_type",
        "onboarding_status",
        "is_active"
      ].join(",")
    )
    .eq("user_id", user.id)
    .maybeSingle<AdminProfileRow>();

  if (profileError) {
    throw new Error("Não foi possível carregar o perfil administrativo.");
  }

  if (!profile || profile.onboarding_status !== "completed") {
    redirect("/register?resume=1");
  }

  if (!profile.is_active) {
    redirect("/login?reason=inactive");
  }

  return <DashboardShell profile={mapProfile(profile)} />;
}
