import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/certificates/print-button";

export const metadata = { title: "Certificate" };

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cert } = await supabase
    .from("certificates")
    .select("*, courses(title), profiles(full_name)")
    .eq("id", id)
    .maybeSingle();

  if (!cert) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || (user.id !== cert.user_id)) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">No Access</h1>
        <p className="mt-3 text-zinc-600">Log in to view this certificate.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Log in
        </Link>
      </main>
    );
  }

  const course = cert.courses as unknown as { title: string } | null;
  const profile = cert.profiles as unknown as { full_name: string | null } | null;
  const issued = new Date(cert.issued_at);

  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-100 px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 w-full max-w-[1123px]">
        <Link
          href="/dashboard/courses"
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          ← My Courses
        </Link>
        <PrintButton />
      </div>

      <div
        id="certificate"
        className="relative w-full max-w-[1123px] overflow-hidden rounded-xl border-8 border-brand-600 bg-white p-2 shadow-lg"
      >
        <div className="rounded-lg border-2 border-brand-600 bg-gradient-to-br from-white to-brand-50 px-10 py-12 text-center sm:px-16">
          <div className="text-5xl">
            <i className="fa-solid fa-graduation-cap text-brand-600" />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.4em] text-zinc-500">
            Plickify Academy
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-wide text-brand-800 sm:text-4xl">
            Certificate of Completion
          </h1>

          <p className="mt-8 text-sm text-zinc-500">This is to certify that</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {profile?.full_name || "Student"}
          </p>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-zinc-600">
            has successfully completed the following course and passed the progress assessment:
          </p>
          <p className="mt-3 text-2xl font-bold text-brand-700">
            {course?.title}
          </p>

          <div className="mx-auto mt-10 flex max-w-lg items-end justify-between gap-6">
            <div className="flex-1 border-t border-zinc-400 pt-2">
              <p className="text-xs text-zinc-500">Date</p>
              <p className="text-sm font-semibold text-zinc-800">
                {issued.toLocaleDateString("bn-BD", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex-1 border-t border-zinc-400 pt-2">
              <p className="text-xs text-zinc-500">Certificate Number</p>
              <p className="text-sm font-semibold text-zinc-800">
                {cert.certificate_number}
              </p>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-lg text-[11px] leading-relaxed text-zinc-400">
            This certificate is issued by the administration of Plickify Academy.
          </p>
        </div>
      </div>
    </main>
  );
}