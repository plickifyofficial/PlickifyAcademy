import Link from "next/link";
import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export const metadata = { title: "Sign Up | Plickify Academy" };

function MarketingPanel() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-brand-700 to-brand-900 p-8 text-white sm:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
      <div className="relative">
        <Link href="/" className="inline-flex items-center gap-2.5 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-700">
            <i className="fa-solid fa-graduation-cap" />
          </span>
          <span className="text-lg font-extrabold">Plickify Academy</span>
        </Link>
        <h2 className="mt-10 text-3xl font-extrabold leading-tight sm:text-4xl">
          Start your
          <br />
          <span className="text-violet-200">digital career today</span>
        </h2>
        <p className="mt-4 max-w-md text-violet-100">
          Join 500+ students learning AI, Freelancing & Digital Skills — practical, project-based, career-focused.
        </p>
        <ul className="mt-8 space-y-3">
          {["No credit card needed", "Instant access after signup", "Lifetime course updates", "Certificate on completion"].map((t) => (
            <li key={t} className="flex items-center gap-3 text-sm font-medium text-white/90">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <i className="fa-solid fa-check text-xs" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative mt-10 rounded-2xl bg-white/10 p-4 backdrop-blur">
        <p className="text-sm font-medium text-white">“Plickify er course practical — 1st month ei freelancing income start!”</p>
        <p className="mt-2 text-xs font-semibold text-violet-200">— Rafiq, Student</p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-zinc-50 px-4 py-10 sm:px-6 lg:py-16">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="hidden lg:block">
          <MarketingPanel />
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg shadow-zinc-200/50">
            <div className="mb-6 text-center lg:hidden">
              <Link href="/" className="mb-6 inline-block text-xl font-extrabold tracking-tight text-brand-700">
                Plickify Academy
              </Link>
            </div>
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-2xl font-bold text-zinc-900">Create Your Account</h1>
              <p className="mt-1 text-sm text-zinc-500">Plickify Academy-তে আপনার learning journey শুরু করুন।</p>
            </div>
            <Suspense fallback={null}>
              <GoogleSignInButton label="Continue with Google" />
            </Suspense>
            <p className="mt-6 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-brand-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}