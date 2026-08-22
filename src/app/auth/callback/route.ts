import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Capture cookies set during the session exchange so we can write them to
  // the outgoing response (mutating request.cookies does NOT persist them).
  const outgoing: { name: string; value: string; options?: Record<string, unknown> }[] =
    [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            outgoing.push({ name, value, options }),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Explicit next path wins (e.g. course page the user came from).
  let target = `${origin}/dashboard`;
  if (next) {
    target = `${origin}${next}`;
  } else {
    // Role-based redirect: admin -> /admin, everyone else -> /dashboard
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin") {
        target = `${origin}/admin`;
      }
    }
  }

  const response = NextResponse.redirect(target);
  outgoing.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options),
  );
  return response;
}
