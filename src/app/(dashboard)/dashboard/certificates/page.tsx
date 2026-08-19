import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCertificatesList } from "@/lib/student";

export const metadata = { title: "My Certificates" };

export default async function CertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const certificates = await getCertificatesList(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900">
          My Certificates
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Certificates you have earned from completed courses.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl text-zinc-400">
            <i className="fa-solid fa-award" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">
            No certificates yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
            Complete 100% of a course to unlock your certificate.
          </p>
          <Link
            href="/dashboard/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Go to My Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl text-white">
                  <i className="fa-solid fa-award" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-zinc-900">
                    {cert.course?.title ?? "Course Certificate"}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Issued{" "}
                    {new Date(cert.issued_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-zinc-400">
                    {cert.certificate_number}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/certificates/${cert.id}`}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
                >
                  View Certificate
                </Link>
                <Link
                  href={`/certificates/${cert.id}`}
                  className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  title="Print"
                >
                  <i className="fa-solid fa-print" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}