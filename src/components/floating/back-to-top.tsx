"use client";

import { useEffect, useState } from "react";
import { logContactEvent } from "@/lib/actions/contact";

export function BackToTop({
  bottom,
  suppressed,
}: {
  bottom: number;
  suppressed: boolean;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setShow(window.scrollY > 400));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!show || suppressed) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        void logContactEvent(
          "back_to_top",
          "Back to Top",
          window.location.pathname,
        );
        setShow(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="z-floating fixed right-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-lg transition-all hover:border-brand-300 hover:text-brand-600 active:scale-95 sm:right-[30px]"
      style={{ bottom }}
    >
      <i className="fa-solid fa-arrow-up" />
    </button>
  );
}