import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const limited = rateLimit(`contact:${ip}`, 8, 10 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: "Please wait a few minutes before sending another message." }, { status: 429 });
  }

  const parsed = contactSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Check the form." }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient() ?? (await createServerSupabaseClient());
  if (!supabase) {
    return NextResponse.json({ error: "Messaging is not configured yet." }, { status: 503 });
  }

  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    company_name: parsed.data.companyName,
    message: parsed.data.message,
  });

  if (error) {
    return NextResponse.json({ error: "Unable to send your message right now." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
