"use client";

import { useState } from "react";
import { deleteMedia } from "@/lib/actions/media";
import { useToast } from "@/components/ui/toaster";

export function MediaDeleteButton({
  bucket,
  path,
}: {
  bucket: string;
  path: string;
}) {
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();

  async function handleDelete() {
    if (!confirm(`"${path}" মুছে ফেলবেন?`)) return;
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("bucket", bucket);
      fd.set("path", path);
      await deleteMedia(fd);
      showToast("ফাইল মুছে ফেলা হয়েছে");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "মুছে ফেলা যায়নি", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="wp-btn wp-btn-danger"
    >
      <i className="fa-solid fa-trash-can" /> {pending ? "মুছছে..." : "মুছুন"}
    </button>
  );
}