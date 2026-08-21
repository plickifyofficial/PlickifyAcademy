import Link from "next/link";
import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export const metadata = { title: "Log In | Plickify Academy" };

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg shadow-zinc-200/50">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mb-6 inline-block text-xl font-extrabold tracking-tight text-brand-700"
          >
            Plickify Academy
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">
            Welcome Back! 👋
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            আপনার learning journey চালিয়ে যান
          </p>
        </div>
        <Suspense fallback={null}>
          <GoogleSignInButton label="Continue with Google" />
        </Suspense>
        <p className="mt-6 text-center text-xs leading-relaxed text-zinc-500">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-zinc-700">
            Terms
          </Link>{" "}
          &{" "}
          <Link href="/privacy" className="underline hover:text-zinc-700">
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}
