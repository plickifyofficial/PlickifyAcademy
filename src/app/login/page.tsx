import Link from "next/link";
import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export const metadata = { title: "Log In | Plickify Academy" };

function MarketingPanel() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-indigo-800 p-8 text-white sm:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="relative">
        <Link href="/" className="inline-flex items-center gap-2.5 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-700">
            <i className="fa-solid fa-graduation-cap" />
          </span>
          <span className="text-lg font-extrabold">Plickify Academy</span>
        </Link>
        <h2 className="mt-10 text-3xl font-extrabold leading-tight sm:text-4xl">
          Welcome back!
          <br />
          <span className="text-brand-200">Continue your learning journey</span>
        </h2>
        <p className="mt-4 max-w-md text-brand-100">
          Log in to access your courses, live classes, certificates and downloads — all in one place.
        </p>
        <ul className="mt-8 space-y-3">
          {[
            "500+ Students trust us",
            "10+ Expert Courses",
            "Live Classes & Recordings",
            "Lifetime Access & Certificates",
          ].map((t) => (
            <li key={t} className="flex items-center gap-3 text-sm font-medium text-white/90">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <i className="fa-solid fa-check text-xs" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative mt-10 flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
        <div className="flex -space-x-2">
          {["bg-blue-500", "bg-violet-500", "bg-emerald-500"].map((c, i) => (
            <span key={i} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-800 text-xs font-bold text-white ${c}`}>
              {["RH", "NJ", "MH"][i]}
            </span>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold">Trusted by 500+ learners</p>
          <p className="text-xs text-brand-100">Real skills, real income</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-1 items-center justify-center bg-zinc-50 px-4 py-10 sm:px-6 lg:py-16">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="hidden lg:block">
          <MarketingPanel />
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg shadow-zinc-200/50">
            <div className="mb-8 text-center lg:hidden">
              <Link href="/" className="mb-6 inline-block text-xl font-extrabold tracking-tight text-brand-700">
                Plickify Academy
              </Link>
            </div>
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-2xl font-bold text-zinc-900">Welcome Back! 👋</h1>
              <p className="mt-1 text-sm text-zinc-500">আপনার learning journey চালিয়ে যান</p>
            </div>
            <Suspense fallback={null}>
              <GoogleSignInButton label="Continue with Google" />
            </Suspense>
            <p className="mt-6 text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-brand-600 hover:underline">
                Create account
              </Link>
            </p>
            <p className="mt-6 text-center text-xs leading-relaxed text-zinc-500">
              By continuing, you agree to our <Link href="/terms" className="underline hover:text-zinc-700">Terms</Link> & <Link href="/privacy" className="underline hover:text-zinc-700">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}