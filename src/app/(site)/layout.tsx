import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AosProvider } from "@/components/ui/aos-provider";

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
  const settings = await getSiteSettings();

  return (
    <>
      <Header settings={settings} />
      <AosProvider>
        <div className="flex flex-1 flex-col">{children}</div>
      </AosProvider>
      <Footer settings={settings} />
    </>
  );
}