"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { toggleWishlist } from "@/lib/actions/learning";
import { cn } from "@/lib/utils";

type Props = {
  courseId: string;
  initialSaved: boolean;
};

export function WishlistButton({ courseId, initialSaved }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    try {
      const nowSaved = await toggleWishlist(courseId);
      setSaved(nowSaved);
      showToast(nowSaved ? "পছন্দের তালিকায় যোগ হয়েছে ❤️" : "পছন্দের তালিকা থেকে সরানো হয়েছে", "success");
      router.refresh();
    } catch (e) {
      showToast((e as Error).message, "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      aria-label="পছন্দের তালিকা"
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-lg border text-lg transition-colors disabled:opacity-60",
        saved
          ? "border-red-200 bg-red-50 text-red-500"
          : "border-white/40 bg-white/10 text-white hover:bg-white/20",
      )}
    >
      <i className={saved ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
    </button>
  );
}