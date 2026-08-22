"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return undefined;
  return next;
}

async function resolveAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  // Fall back to the actual request host so OAuth redirectTo points at the
  // real deployment (not localhost) when NEXT_PUBLIC_APP_URL is unset.
  const h = await headers();
  const host = h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

export async function signInWithGoogle(next?: string) {
  const supabase = await createClient();
  const appUrl = await resolveAppUrl();

  const redirectTo = new URL(`${appUrl}/auth/callback`);
  const nextPath = safeNextPath(next);
  if (nextPath) {
    redirectTo.searchParams.set("next", nextPath);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo.toString(),
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
