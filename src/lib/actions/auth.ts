"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return undefined;
  return next;
}

export async function signInWithGoogle(next?: string) {
  const supabase = await createClient();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
