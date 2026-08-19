import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { AosProvider } from "@/components/ui/aos-provider";
import { getSiteContent } from "@/lib/site-content";
import { footerDefaults, navDefaults } from "@/lib/content-schema";

const getSiteSettings = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("site_name, tagline, logo_url, favicon_url")
      .eq("id", 1)
      .single();
    return data;
  },
  ["site-settings"],
  { revalidate: 300 },
);

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, nav, footer] = await Promise.all([
    getSiteSettings(),
    getSiteContent("global.nav", navDefaults),
    getSiteContent("global.footer", footerDefaults),
  ]);

  return (
    <>
      <AnnouncementBar />
      <Header settings={settings} nav={nav.links} />
      <AosProvider>
        <div className="flex flex-1 flex-col">{children}</div>
      </AosProvider>
      <Footer settings={settings} content={footer} />
    </>
  );
}
