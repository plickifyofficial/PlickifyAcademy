"use client";

import { useEffect, useRef, useCallback } from "react";

export function NavigationLoader() {
  const barRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>(0);
  const fadeTimer = useRef<number>(0);

  const complete = useCallback(() => {
    clearTimeout(hideTimer.current);
    clearTimeout(fadeTimer.current);
    if (barRef.current) {
      barRef.current.style.width = "100%";
      barRef.current.style.opacity = "1";
      fadeTimer.current = window.setTimeout(() => {
        if (barRef.current) barRef.current.style.opacity = "0";
      }, 150);
      hideTimer.current = window.setTimeout(() => {
        if (barRef.current) {
          barRef.current.style.width = "0%";
          barRef.current.style.opacity = "0";
        }
      }, 350);
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        href.startsWith("http")
      )
        return;
      if (barRef.current) {
        clearTimeout(hideTimer.current);
        clearTimeout(fadeTimer.current);
        barRef.current.style.transition = "width 0.4s ease, opacity 0.15s ease";
        barRef.current.style.width = "70%";
        barRef.current.style.opacity = "1";
      }
    };

    const handlePopState = () => complete();

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      clearTimeout(hideTimer.current);
      clearTimeout(fadeTimer.current);
    };
  }, [complete]);

  return (
    <div
      ref={barRef}
      className="pointer-events-none fixed left-0 top-0 z-[200] h-[3px] w-0 rounded-r-full bg-gradient-to-r from-brand-500 to-brand-700 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
      style={{ opacity: 0, transition: "width 0.4s ease, opacity 0.15s ease" }}
    />
  );
}
