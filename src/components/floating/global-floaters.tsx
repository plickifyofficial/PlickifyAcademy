"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { resolvePlacement } from "@/lib/floating";
import { BackToTop } from "@/components/floating/back-to-top";
import { FloatingContact } from "@/components/floating/floating-contact";
import type { ContactSettingsContent } from "@/lib/content-schema";

const LiveChatWidget = dynamic(
  () =>
    import("@/components/floating/live-chat-widget").then(
      (m) => m.LiveChatWidget,
    ),
  { ssr: false },
);

export function GlobalFloaters({
  settings,
}: {
  settings: ContactSettingsContent;
}) {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [extra, setExtra] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setIsMobile(mq.matches);
      let max = 0;
      document.querySelectorAll<HTMLElement>("[data-floating-obstacle]").forEach(
        (el) => {
          const rect = el.getBoundingClientRect();
          if (rect.height === 0) return;
          const h = window.innerHeight - rect.top;
          if (h > max) max = h;
        },
      );
      let safe = 0;
      const v = getComputedStyle(document.documentElement).getPropertyValue(
        "--safe-area-bottom",
      );
      const n = parseFloat(v);
      if (!Number.isNaN(n)) safe = n;
      setExtra(max + safe);
    };
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [pathname]);

  if (!resolvePlacement(settings.placement, pathname)) return null;

  const contactBottom = (isMobile ? 140 : 90) + extra;
  const bttBottom = contactBottom + 60;

  const showContact =
    settings.enabled &&
    (settings.liveChatEnabled ||
      (settings.whatsappEnabled && settings.whatsappNumber.trim()) ||
      (settings.messengerEnabled && settings.messengerUrl.trim()));

  return (
    <>
      {settings.backToTopEnabled && (
        <BackToTop bottom={bttBottom} suppressed={menuOpen || chatOpen} />
      )}
      {showContact && !chatOpen && (
        <FloatingContact
          settings={settings}
          bottom={contactBottom}
          onOpenChat={() => setChatOpen(true)}
          onOpenChange={setMenuOpen}
        />
      )}
      {chatOpen && settings.liveChatEnabled && (
        <LiveChatWidget settings={settings} onClose={() => setChatOpen(false)} />
      )}
    </>
  );
}