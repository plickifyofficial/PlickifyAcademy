import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export const metadata = { title: "à¦²à¦—à¦‡à¦¨" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            à¦†à¦¬à¦¾à¦° à¦¦à§‡à¦–à¦›à¦¿ à¦†à¦ªà¦¨à¦¾à¦•à§‡
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Google à¦à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦¦à¦¿à¦¯à¦¼à§‡ à¦²à¦—à¦‡à¦¨ à¦•à¦°à§à¦¨
          </p>
        </div>
        <GoogleSignInButton label="Google à¦¦à¦¿à¦¯à¦¼à§‡ à¦²à¦—à¦‡à¦¨" />
        <p className="mt-6 text-center text-sm text-zinc-500">
          à¦¨à¦¤à§à¦¨?{" "}
          <Link
            href="/signup"
            className="font-medium text-brand-600 hover:underline"
          >
            à¦à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦–à§à¦²à§à¦¨
          </Link>
        </p>
      </div>
    </main>
  );
}