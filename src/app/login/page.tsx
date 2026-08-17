import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "লগইন" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            আবার দেখছি আপনাকে 👋
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            আপনার একাউন্টে লগইন করুন
          </p>
        </div>
        <AuthForm
          mode="login"
          action={async (formData) => {
            "use server";
            return await login(formData);
          }}
        />
        <p className="mt-6 text-center text-sm text-zinc-500">
          একাউন্ট নেই?{" "}
          <Link
            href="/signup"
            className="font-medium text-indigo-600 hover:underline"
          >
            সাইন আপ করুন
          </Link>
        </p>
      </div>
    </main>
  );
}
