import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "সাইন আপ" };

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            নতুন একাউন্ট খুলুন
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            শেখা শুরু করার জন্য সাইন আপ করুন
          </p>
        </div>
        <AuthForm
          mode="signup"
          action={async (formData) => {
            "use server";
            return await signup(formData);
          }}
        />
        <p className="mt-6 text-center text-sm text-zinc-500">
          ইতিমধ্যে একাউন্ট আছে?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:underline"
          >
            লগইন করুন
          </Link>
        </p>
      </div>
    </main>
  );
}
