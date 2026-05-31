// web/src/app/api/onboarding/complete/route.ts
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { resolveInitialBotanicIdentity } from "@/lib/botanic/server";
import { createSupabaseServerAdminClient } from "@/lib/supabase/server-admin";
import { onboardingServerPayloadSchema } from "@/schemas/onboarding.schema";

export const runtime = "nodejs";

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/^@/, "");
}

function onlyDigits(value: string | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

function normalizeRegion(value: string | undefined): string {
  const normalized = (value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return normalized || "NA";
}

function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value.trim()).digest("hex");
}

function hashCpf(cpf: string | undefined): { cpfLast4: string | null; cpfSha256: string | null } {
  const digits = onlyDigits(cpf);

  if (digits.length !== 11) {
    return { cpfLast4: null, cpfSha256: null };
  }

  return {
    cpfLast4: digits.slice(-4),
    cpfSha256: crypto.createHash("sha256").update(digits).digest("hex"),
  };
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
}

async function validateOrganizationAccessCode(params: {
  supabase: ReturnType<typeof createSupabaseServerAdminClient>;
  organizationId: string;
  code: string | undefined;
}) {
  const { supabase, organizationId, code } = params;

  if (!supabase || !code?.trim()) {
    return { ok: false, roleLabel: null, codeId: null, nextUsedCount: null };
  }

  const codeHash = hashValue(code);

  const { data } = await supabase
    .from("admin_organization_access_codes")
    .select("id, role_label, max_uses, used_count, expires_at, is_active")
    .eq("organization_id", organizationId)
    .eq("code_hash", codeHash)
    .maybeSingle();

  if (!data || !data.is_active) {
    return { ok: false, roleLabel: null, codeId: null, nextUsedCount: null };
  }

  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) {
    return { ok: false, roleLabel: null, codeId: null, nextUsedCount: null };
  }

  if (data.max_uses !== null && data.used_count >= data.max_uses) {
    return { ok: false, roleLabel: null, codeId: null, nextUsedCount: null };
  }

  return {
    ok: true,
    roleLabel: data.role_label,
    codeId: data.id,
    nextUsedCount: data.used_count + 1,
  };
}

export async function POST(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ ok: false, message: "Sessão ausente." }, { status: 401 });
  }

  const supabase = createSupabaseServerAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase server-side não configurado." },
      { status: 500 },
    );
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    return NextResponse.json({ ok: false, message: "Sessão inválida." }, { status: 401 });
  }

  const rawBody = await request.json();
  const parsed = onboardingServerPayloadSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Dados do onboarding inválidos.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const userId = authData.user.id;
  const username = normalizeUsername(payload.username);
  const { cpfLast4, cpfSha256 } = hashCpf(payload.cpf);
  const regionCode = normalizeRegion(payload.state);
  const countryCode = "BRA";

  const botanicIdentityResolution = await resolveInitialBotanicIdentity({
    supabase,
    payload,
    userId,
    email: payload.email,
  });

  if (!botanicIdentityResolution.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: botanicIdentityResolution.message,
      },
      { status: botanicIdentityResolution.status },
    );
  }

  const { data: ecosystemProfile, error: ecosystemProfileError } = await supabase
    .from("ecosystem_profiles")
    .upsert(
      {
        user_id: userId,
        display_name: payload.fullName,
        username,
        bio: payload.profileBio?.trim() || null,
        avatar_path: payload.avatarPath || null,
        cover_path: payload.coverPath || null,
        avatar_transform: payload.avatarTransform ?? {},
        cover_transform: payload.coverTransform ?? {},
        region_code: regionCode,
        country_code: countryCode,
        profile_status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();

  if (ecosystemProfileError || !ecosystemProfile) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível salvar o perfil global." },
      { status: 500 },
    );
  }

  const { data: botanicIdentity, error: botanicIdentityError } = await supabase
    .from("botanic_identities")
    .upsert(
      {
        user_id: userId,
        profile_id: ecosystemProfile.id,
        species_code: botanicIdentityResolution.identity.speciesCode,
        stage_code: botanicIdentityResolution.identity.stageCode,
        inclination_code: botanicIdentityResolution.identity.inclinationCode,
        account_prefix: "IRS",
        region_code: regionCode,
        country_code: countryCode,
        governance_role_code: botanicIdentityResolution.identity.governanceRoleCode,
        root_governance_enabled: botanicIdentityResolution.identity.rootGovernanceEnabled,
        identity_status: "active",
        assignment_source: botanicIdentityResolution.identity.assignmentSource,
        assigned_reason: botanicIdentityResolution.identity.assignedReason,
        metadata: botanicIdentityResolution.identity.metadata,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("id, diagnostic_code")
    .single();

  if (botanicIdentityError || !botanicIdentity) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível criar a identidade botânica." },
      { status: 500 },
    );
  }

  if (botanicIdentityResolution.internalCreationKeyId) {
    await supabase
      .from("botanic_internal_creation_keys")
      .update({
        used_count: botanicIdentityResolution.nextInternalCreationKeyUsage,
      })
      .eq("id", botanicIdentityResolution.internalCreationKeyId);
  }

  const { error: profileError } = await supabase.from("admin_profiles").upsert(
    {
      user_id: userId,
      email: payload.email.toLowerCase(),
      full_name: payload.fullName,
      username,
      account_scope: payload.accountScope,
      internal_role: payload.accountScope === "internal" ? payload.internalRole : null,
      internal_team: payload.accountScope === "internal" ? payload.internalTeam : null,
      external_account_type:
        payload.accountScope === "external" ? payload.externalAccountType : null,
      onboarding_status: "completed",
      onboarding_step: 10,
      terms_accepted_at: payload.acceptedTerms ? new Date().toISOString() : null,
      partner_terms_accepted_at:
        payload.accountScope === "external" && payload.acceptedPartnerTerms
          ? new Date().toISOString()
          : null,
      botanic_identity_id: botanicIdentity.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (profileError) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível salvar o perfil administrativo." },
      { status: 500 },
    );
  }

  const { error: personalError } = await supabase.from("admin_private_personal_details").upsert(
    {
      user_id: userId,
      cpf_last4: cpfLast4,
      cpf_sha256: cpfSha256,
      birth_date: payload.birthDate || null,
      cep: onlyDigits(payload.cep) || null,
      address_payload: {
        addressLine: payload.addressLine || null,
        addressNumber: payload.addressNumber || null,
        addressComplement: payload.addressComplement || null,
        neighborhood: payload.neighborhood || null,
        city: payload.city || null,
        state: payload.state || null,
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (personalError) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível salvar os dados privados." },
      { status: 500 },
    );
  }

  const { error: preferencesError } = await supabase
    .from("admin_notification_preferences")
    .upsert(
      {
        user_id: userId,
        channels: payload.notificationChannels,
        frequency: payload.notificationFrequency,
        topics: payload.notificationTopics,
        tour_enabled: payload.allowTour,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (preferencesError) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível salvar preferências." },
      { status: 500 },
    );
  }

  const isInstitutionalExternal =
    payload.accountScope === "external" && payload.externalAccountType !== "final_customer";

  if (isInstitutionalExternal) {
    if (payload.organizationFlow === "existing" && payload.organizationId) {
      const accessValidation = await validateOrganizationAccessCode({
        supabase,
        organizationId: payload.organizationId,
        code: payload.organizationAccessCode,
      });

      if (accessValidation.ok) {
        await supabase.from("admin_organization_members").upsert(
          {
            organization_id: payload.organizationId,
            user_id: userId,
            role_label: payload.businessPosition || accessValidation.roleLabel || "member",
            business_phone: payload.businessPhone || null,
          },
          { onConflict: "organization_id,user_id" },
        );

        if (accessValidation.codeId && accessValidation.nextUsedCount !== null) {
          await supabase
            .from("admin_organization_access_codes")
            .update({ used_count: accessValidation.nextUsedCount })
            .eq("id", accessValidation.codeId);
        }
      } else {
        await supabase.from("admin_organization_join_requests").insert({
          organization_id: payload.organizationId,
          requester_user_id: userId,
          requester_email: payload.email.toLowerCase(),
          relation_type: payload.organizationRelation || "employee",
          requested_role: payload.businessPosition || null,
          organization_name_snapshot: payload.organizationName || null,
          organization_cnpj_snapshot: onlyDigits(payload.organizationCnpj) || null,
          status: "pending",
          message: "Associação solicitada sem código válido de organização.",
        });
      }
    }

    if (payload.organizationFlow === "create") {
      if (payload.organizationRelation === "owner") {
        const { data: organization, error: organizationError } = await supabase
          .from("admin_organizations")
          .insert({
            legal_name: payload.organizationName,
            normalized_legal_name: payload.organizationName?.trim().toLowerCase() || null,
            cnpj: onlyDigits(payload.organizationCnpj) || null,
            segment: payload.organizationSegment || null,
            owner_user_id: userId,
            created_by: userId,
            verification_status: "pending",
          })
          .select("id")
          .single();

        if (organizationError || !organization) {
          return NextResponse.json(
            { ok: false, message: "Não foi possível criar a organização." },
            { status: 500 },
          );
        }

        await supabase.from("admin_organization_members").insert({
          organization_id: organization.id,
          user_id: userId,
          role_label: payload.businessPosition || "owner",
          business_phone: payload.businessPhone || null,
        });
      } else {
        await supabase.from("admin_organization_join_requests").insert({
          requester_user_id: userId,
          requester_email: payload.email.toLowerCase(),
          relation_type: "employee",
          requested_role: payload.businessPosition || null,
          organization_name_snapshot: payload.organizationName || null,
          organization_cnpj_snapshot: onlyDigits(payload.organizationCnpj) || null,
          status: "contact_required",
          message: "Entraremos em contato para confirmar as informações.",
        });
      }
    }
  }

  await supabase.from("admin_onboarding_drafts").delete().eq("user_id", userId);

  return NextResponse.json({
    ok: true,
    redirectTo: "/dashboard",
    diagnosticCode: botanicIdentity.diagnostic_code,
  });
}
