import Link from "next/link";
import { getSiteContent } from "@/lib/site-content";
import { announcementDefaults } from "@/lib/content-schema";

export async function AnnouncementBar() {
  const announcement = await getSiteContent(
    "global.announcement",
    announcementDefaults,
  );

  if (!announcement.is_enabled || !announcement.text) return null;

  return (
    <div className={announcement.bg || "bg-indigo-600"}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-sm font-medium text-white">
        <span>{announcement.text}</span>
        {announcement.link && (
          <Link
            href={announcement.link}
            className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
          >
            {announcement.linkText || "Learn more"}
            <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        )}
      </div>
    </div>
  );
}