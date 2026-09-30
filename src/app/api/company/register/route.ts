import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { registerCompanyRequestSchema } from "@/lib/auth-errors";
import { rateLimit } from "@/lib/rate-limit";
import { slugify } from "@/lib/utils";
import { writeAudit } from "@/lib/services/audit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const limited = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many registration attempts. Try again later." }, { status: 429 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });
  }

  const body = await request.json();
  const parsed = registerCompanyRequestSchema.safeParse({
    ...body,
    loginEmail: body.loginEmail || body.email,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check company details." }, { status: 400 });
  }

  const loginEmail = parsed.data.loginEmail.toLowerCase();
  let userId: string | null = null;

  const created = await admin.auth.admin.createUser({
    email: loginEmail,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.ownerName },
  });

  if (created.data.user) {
    userId = created.data.user.id;
  } else {
    const already =
      created.error?.message?.toLowerCase().includes("already") ||
      created.error?.message?.toLowerCase().includes("registered");
    if (!already) {
      return NextResponse.json({ error: "Unable to create the account." }, { status: 400 });
    }

    const { data: profile } = await admin.from("users").select("id, company_id").eq("email", loginEmail).maybeSingle();
    if (profile?.company_id) {
      return NextResponse.json({ error: "An account with this email already belongs to a company. Login instead." }, { status: 409 });
    }

    if (profile?.id) {
      userId = profile.id;
    } else {
      const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const authUser = listed.users.find((user) => user.email?.toLowerCase() === loginEmail);
      if (!authUser) {
        return NextResponse.json({ error: "An account with this email already exists. Login instead." }, { status: 409 });
      }
      userId = authUser.id;
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.ownerName },
    });
    if (updateError) {
      return NextResponse.json({ error: "Unable to activate this account. Try a different email." }, { status: 400 });
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Unable to create the account." }, { status: 400 });
  }

  const { data: existing } = await admin.from("users").select("company_id").eq("id", userId).maybeSingle();
  if (existing?.company_id) {
    return NextResponse.json({ error: "This account already belongs to a company. Login instead." }, { status: 409 });
  }

  await admin.from("users").upsert({
    id: userId,
    email: loginEmail,
    full_name: parsed.data.ownerName,
    is_active: true,
  });

  const { data: freePlan } = await admin.from("plans").select("id").eq("slug", "free").maybeSingle();
  if (!freePlan) {
    return NextResponse.json({ error: "The Free plan is not available. Run the SQL seed migrations first." }, { status: 500 });
  }

  const slug = `${slugify(parsed.data.companyName)}-${crypto.randomUUID().slice(0, 8)}`;
  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({
      name: parsed.data.companyName,
      legal_name: parsed.data.legalName || parsed.data.companyName,
      slug,
      email: parsed.data.email || loginEmail,
      phone: parsed.data.phone,
      address_line1: parsed.data.addressLine1,
      city: parsed.data.city,
      website: parsed.data.website || null,
      gstin: parsed.data.gstin,
      status: "onboarding",
      onboarding_step: 4,
      created_by: userId,
    })
    .select("id")
    .single();

  if (companyError || !company) {
    return NextResponse.json({ error: "Unable to create the company." }, { status: 400 });
  }

  await admin.from("users").upsert({
    id: userId,
    company_id: company.id,
    email: loginEmail,
    full_name: parsed.data.ownerName,
    is_active: true,
  });

  await admin.rpc("seed_company_defaults", { p_company_id: company.id });
  await admin.rpc("assign_company_owner", { p_company_id: company.id, p_user_id: userId });

  await admin.from("subscriptions").insert({
    company_id: company.id,
    plan_id: freePlan.id,
    status: "active",
    billing_cycle: "monthly",
    current_period_start: new Date().toISOString().slice(0, 10),
  });

  await writeAudit({
    companyId: company.id,
    actorId: userId,
    action: "company.created",
    entity: "companies",
    entityId: company.id,
    newValue: { name: parsed.data.companyName, plan: "free" },
  });

  return NextResponse.json({ companyId: company.id });
}
