import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_EVENTS = new Set([
  "marketing_landing_viewed",
  "admin_login_viewed",
  "admin_login_attempted",
]);

function createAnonymousId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventName =
    typeof body === "object" &&
    body &&
    "eventName" in body &&
    typeof body.eventName === "string"
      ? body.eventName
      : "";

  if (!ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const properties =
    typeof body === "object" &&
    body &&
    "properties" in body &&
    typeof body.properties === "object" &&
    body.properties
      ? body.properties
      : {};

  const cookieName = "mtp_anon_id";
  const anonymousId = request.cookies.get(cookieName)?.value ?? createAnonymousId();
  const response = NextResponse.json({ ok: true });

  if (!request.cookies.get(cookieName)?.value) {
    response.cookies.set(cookieName, anonymousId, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from("app_events").insert({
      anonymous_id: anonymousId,
      event_name: eventName,
      app_surface: "web",
      platform: "web",
      path: request.nextUrl.pathname,
      properties,
    });
  } catch {
    // Analytics must never break the public site.
  }

  return response;
}
