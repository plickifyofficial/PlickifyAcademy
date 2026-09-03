import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { PopupBanner } from "@/components/layout/popup-banner";
import { AosProvider } from "@/components/ui/aos-provider";
import { getSiteContent } from "@/lib/site-content";
import { getSiteSettings } from "@/lib/settings";
import {
  footerDefaults,
  navDefaults,
  popupDefaults,
} from "@/lib/content-schema";

export const revalidate = 60;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, nav, footer, popup, footerPages] = await Promise.all([
    getSiteSettings(),
    getSiteContent("global.nav", navDefaults),
    getSiteContent("global.footer", footerDefaults),
    getSiteContent("global.popup", popupDefaults),
    (async () => {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("custom_pages")
        .select("slug, title")
        .eq("is_published", true)
        .eq("show_in_footer", true);
      return data ?? [];
    })(),
  ]);

  if (footerPages.length > 0) {
    footer.supportLinks = [
      ...footer.supportLinks,
      ...footerPages.map((p) => ({
        label: p.title,
        href: `/p/${p.slug}`,
      })),
    ];
  }

  if (settings?.maintenance_mode) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let isAdmin = false;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        isAdmin = profile?.role === "admin";
      }
      if (!isAdmin) {
        return (
          <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-brand-950 px-4 text-center text-white">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
              <i className="fa-solid fa-screwdriver-wrench text-brand-300" />
            </span>
            <h1 className="mt-6 text-2xl font-extrabold sm:text-3xl">
              We are doing some maintenance
            </h1>
            <p className="mt-3 max-w-md text-zinc-300">
              {settings.maintenance_message ||
                "We will be back soon! Please check again in a little while."}
            </p>
          </div>
        );
      }
    } catch {
      // If cookie check fails, continue rendering
    }
  }

  return (
    <>
      <AnnouncementBar />
      <Header settings={settings} nav={nav.links} />
      <AosProvider>
        <div className="flex flex-1 flex-col">{children}</div>
      </AosProvider>
      <Footer settings={settings} content={footer} />
      {popup.is_enabled ? <PopupBanner content={popup} /> : null}
    </>
  );
}