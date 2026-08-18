import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export const metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Log in with your Google account
          </p>
        </div>
        <GoogleSignInButton label="Continue with Google" />
        <p className="mt-6 text-center text-sm text-zinc-500">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-brand-600 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}