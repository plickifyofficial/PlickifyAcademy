import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("favicon_url")
    .eq("id", 1)
    .single();

  if (data?.favicon_url) {
    return NextResponse.redirect(data.favicon_url);
  }

  return NextResponse.redirect(new URL("/favicon.ico", "https://www.plickifyacademy.com"));
}