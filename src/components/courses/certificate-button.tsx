"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { issueCertificate } from "@/lib/actions/learning";
import { useToast } from "@/components/ui/toaster";

export function CertificateButton({
  courseId,
  completed,
  certificateId,
}: {
  courseId: string;
  completed: boolean;
  certificateId: string | null;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  if (certificateId) {
    return (
      <a
        href={`/certificates/${certificateId}`}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
      >
        <i className="fa-solid fa-award" /> সার্টিফিকেট দেখুন
      </a>
    );
  }

  if (!completed) return null;

  async function handleIssue() {
    setPending(true);
    try {
      const id = await issueCertificate(courseId);
      if (id) {
        showToast("অভিনন্দন! সার্টিফিকেট তৈরি হয়েছে 🎉");
        router.push(`/certificates/${id}`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "সার্টিফিকেট তৈরি হয়নি", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleIssue}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
    >
      <i className="fa-solid fa-award" />
      {pending ? "তৈরি হচ্ছে..." : "সার্টিফিকেট নিন"}
    </button>
  );
}