import Link from "next/link";
import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export const metadata = { title: "Log In | Plickify Academy" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1">
      {/* Marketing — full height, no box */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-800 via-brand-700 to-indigo-800 p-10 text-white lg:flex">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-700">
              <i className="fa-solid fa-graduation-cap" />
            </span>
            <span className="text-lg font-extrabold">Plickify Academy</span>
          </Link>
          <h1 className="mt-16 text-4xl font-extrabold leading-tight">
            Welcome back!
            <br />
            <span className="text-brand-200">Continue your learning</span>
          </h1>
          <p className="mt-4 max-w-md text-brand-100">
            Log in to access your courses, live classes, certificates and downloads — all in one place.
          </p>
          <ul className="mt-10 space-y-3">
            {["500+ Students trust us", "10+ Expert Courses", "Live Classes & Recordings", "Lifetime Access & Certificates"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm font-medium text-white/90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <i className="fa-solid fa-check text-xs" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
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

      {/* Form — full height, centered */}
      <div className="flex w-full items-center justify-center bg-white px-4 py-10 sm:px-6 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-brand-600 lg:hidden">
            <i className="fa-solid fa-arrow-left" /> Back to home
          </Link>
          <h2 className="text-2xl font-bold text-zinc-900">Welcome Back! 👋</h2>
          <p className="mt-1 text-sm text-zinc-500">আপনার learning journey চালিয়ে যান</p>
          <div className="mt-8">
            <Suspense fallback={null}>
              <GoogleSignInButton label="Continue with Google" />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account? <Link href="/signup" className="font-medium text-brand-600 hover:underline">Create account</Link>
          </p>
          <p className="mt-8 text-center text-xs leading-relaxed text-zinc-500">
            By continuing, you agree to our <Link href="/terms" className="underline hover:text-zinc-700">Terms</Link> & <Link href="/privacy" className="underline hover:text-zinc-700">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </main>
  );
}