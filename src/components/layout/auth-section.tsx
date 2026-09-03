"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserMenu } from "@/components/layout/user-menu";

export function AuthSection() {
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (user) return <UserMenu />;

  return (
    <>
      <Link
        href="/login"
        className="flex min-h-10 items-center rounded-full border border-zinc-300 bg-white px-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-500 hover:text-brand-600 sm:min-h-11 sm:px-4"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="hidden min-h-11 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-colors hover:bg-brand-700 md:flex"
      >
        Join Now
      </Link>
    </>
  );
}