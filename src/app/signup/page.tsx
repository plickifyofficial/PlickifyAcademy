import Link from "next/link";
import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export const metadata = { title: "Sign Up | Plickify Academy" };

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-1">
      {/* Marketing — full height */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-violet-700 via-brand-700 to-brand-900 p-10 text-white lg:flex">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-700">
              <i className="fa-solid fa-graduation-cap" />
            </span>
            <span className="text-lg font-extrabold">Plickify Academy</span>
          </Link>
          <h1 className="mt-16 text-4xl font-extrabold leading-tight">
            Start your
            <br />
            <span className="text-violet-200">digital career today</span>
          </h1>
          <p className="mt-4 max-w-md text-violet-100">
            Join 500+ students learning AI, Freelancing & Digital Skills — practical, project-based, career-focused.
          </p>
          <ul className="mt-10 space-y-3">
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
        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          <p className="text-sm font-medium text-white">“Plickify er course practical — 1st month ei freelancing income start!”</p>
          <p className="mt-2 text-xs font-semibold text-violet-200">— Rafiq, Student</p>
        </div>
      </div>

      {/* Form — full height */}
      <div className="flex w-full items-center justify-center bg-white px-4 py-10 sm:px-6 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-brand-600 lg:hidden">
            <i className="fa-solid fa-arrow-left" /> Back to home
          </Link>
          <h2 className="text-2xl font-bold text-zinc-900">Create Your Account</h2>
          <p className="mt-1 text-sm text-zinc-500">Plickify Academy-তে আপনার learning journey শুরু করুন।</p>
          <div className="mt-8">
            <Suspense fallback={null}>
              <GoogleSignInButton label="Continue with Google" />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account? <Link href="/login" className="font-medium text-brand-600 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}