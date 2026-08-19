"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { saveSiteSettings } from "@/lib/actions/settings";

type Settings = {
  site_name: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  bkash_number: string | null;
  nagad_number: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  social_facebook: string | null;
  social_youtube: string | null;
  social_linkedin: string | null;
  social_instagram: string | null;
  social_telegram: string | null;
  maintenance_mode: boolean;
  maintenance_message: string | null;
};

export function SiteSettingsForm({ settings }: { settings: Settings }) {
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo_url);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(settings.favicon_url);
  const [ogPreview, setOgPreview] = useState<string | null>(settings.og_image);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      await saveSiteSettings(new FormData(e.currentTarget));
      showToast("Site settings saved");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setPending(false);
    }
  }

  function previewFile(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string | null) => void,
  ) {
    const file = e.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  }

  const input = "wp-input";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="wp-panel">
          <div className="wp-panel-header">
            <i className="fa-solid fa-circle-info text-[#2271b1]" /> General Info
          </div>
          <div className="wp-panel-body space-y-4">
            <div>
              <label className="wp-label">Site Name</label>
              <input name="site_name" defaultValue={settings.site_name} className={input} />
            </div>
            <div>
              <label className="wp-label">Tagline</label>
              <input name="tagline" defaultValue={settings.tagline} placeholder="Learn, grow up" className={input} />
            </div>
          </div>
        </div>

        <div className="wp-panel">
          <div className="wp-panel-header">
            <i className="fa-solid fa-images text-[#2271b1]" /> Logo & Favicon
          </div>
          <div className="wp-panel-body space-y-5">
            <div>
              <label className="wp-label">Logo</label>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded border border-[#c3c4c7] bg-[#f0f0f1]">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                  ) : (
                    <i className="fa-solid fa-image text-2xl text-[#8c8f94]" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block cursor-pointer rounded border border-dashed border-[#8c8f94] px-4 py-3 text-center text-sm font-medium text-[#2271b1] hover:border-[#2271b1]">
                    Upload Logo
                    <input
                      type="file"
                      name="logo_file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => previewFile(e, setLogoPreview)}
                    />
                  </label>
                  <p className="mt-2 text-xs text-[#646970]">PNG/JPG/WebP/SVG — max 2MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="wp-label">Favicon</label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-[#c3c4c7] bg-[#f0f0f1]">
                  {faviconPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={faviconPreview} alt="Favicon preview" className="h-full w-full object-contain" />
                  ) : (
                    <i className="fa-solid fa-globe text-2xl text-[#8c8f94]" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block cursor-pointer rounded border border-dashed border-[#8c8f94] px-4 py-3 text-center text-sm font-medium text-[#2271b1] hover:border-[#2271b1]">
                    Upload Favicon
                    <input
                      type="file"
                      name="favicon_file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
                      className="hidden"
                      onChange={(e) => previewFile(e, setFaviconPreview)}
                    />
                  </label>
                  <p className="mt-2 text-xs text-[#646970]">PNG (32×32 or larger) / SVG — max 2MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wp-panel">
        <div className="wp-panel-header">
          <i className="fa-solid fa-money-bill-wave text-[#2271b1]" /> Payment Settings
        </div>
        <div className="wp-panel-body">
          <p className="mb-4 text-xs text-[#646970]">
            These numbers are shown on the course and product checkout pages for manual bKash / Nagad
            payments.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="wp-label">bKash Number</label>
              <input
                name="bkash_number"
                defaultValue={settings.bkash_number ?? ""}
                placeholder="e.g. 017XXXXXXXX"
                className={input}
              />
            </div>
            <div>
              <label className="wp-label">Nagad Number</label>
              <input
                name="nagad_number"
                defaultValue={settings.nagad_number ?? ""}
                placeholder="e.g. 017XXXXXXXX"
                className={input}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="wp-panel">
        <div className="wp-panel-header">
          <i className="fa-solid fa-magnifying-glass-chart text-[#2271b1]" /> SEO & Sharing
        </div>
        <div className="wp-panel-body space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="wp-label">Default SEO Title</label>
              <input
                name="seo_title"
                defaultValue={settings.seo_title ?? ""}
                placeholder="Plickify Academy | Learn, Grow"
                className={input}
              />
            </div>
            <div>
              <label className="wp-label">Default Meta Description</label>
              <input
                name="seo_description"
                defaultValue={settings.seo_description ?? ""}
                placeholder="An online academy — build your skills..."
                className={input}
              />
            </div>
          </div>

          <div>
            <label className="wp-label">Social Share Image (OG Image)</label>
            <div className="flex items-start gap-3">
              <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded border border-[#c3c4c7] bg-[#f0f0f1]">
                {ogPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ogPreview} alt="OG preview" className="h-full w-full object-cover" />
                ) : (
                  <i className="fa-solid fa-image text-[#8c8f94]" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  name="og_image"
                  defaultValue={settings.og_image ?? ""}
                  placeholder="Image URL or upload"
                  className={input}
                />
                <label className="block w-fit cursor-pointer rounded border border-dashed border-[#8c8f94] px-3 py-2 text-center text-xs font-medium text-[#2271b1] hover:border-[#2271b1]">
                  <i className="fa-solid fa-upload mr-1" /> Upload Image
                  <input
                    type="file"
                    name="og_image_file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => previewFile(e, setOgPreview)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="wp-label">Facebook URL</label>
              <input name="social_facebook" defaultValue={settings.social_facebook ?? ""} placeholder="https://facebook.com/..." className={input} />
            </div>
            <div>
              <label className="wp-label">YouTube URL</label>
              <input name="social_youtube" defaultValue={settings.social_youtube ?? ""} placeholder="https://youtube.com/..." className={input} />
            </div>
            <div>
              <label className="wp-label">LinkedIn URL</label>
              <input name="social_linkedin" defaultValue={settings.social_linkedin ?? ""} placeholder="https://linkedin.com/..." className={input} />
            </div>
            <div>
              <label className="wp-label">Instagram URL</label>
              <input name="social_instagram" defaultValue={settings.social_instagram ?? ""} placeholder="https://instagram.com/..." className={input} />
            </div>
            <div>
              <label className="wp-label">Telegram URL</label>
              <input name="social_telegram" defaultValue={settings.social_telegram ?? ""} placeholder="https://t.me/..." className={input} />
            </div>
          </div>
        </div>
      </div>

      <div className="wp-panel">
        <div className="wp-panel-header">
          <i className="fa-solid fa-wrench text-[#2271b1]" /> Maintenance Mode
        </div>
        <div className="wp-panel-body space-y-4">
          <label className="flex items-center gap-2 text-sm text-[#3c434a]">
            <input
              type="checkbox"
              name="maintenance_mode"
              defaultChecked={settings.maintenance_mode}
              className="wp-checkbox"
            />
            Enable maintenance mode
          </label>
          <p className="text-xs text-[#646970]">
            When enabled, visitors see a maintenance screen. Admins and logged-in users can still browse
            the site.
          </p>
          <div>
            <label className="wp-label">Maintenance Message</label>
            <input
              name="maintenance_message"
              defaultValue={settings.maintenance_message ?? ""}
              placeholder="We will be back soon!"
              className={input}
            />
          </div>
        </div>
      </div>

      <div>
        <button type="submit" disabled={pending} className="wp-btn wp-btn-primary">
          <i className="fa-solid fa-floppy-disk" />
          {pending ? "Saving..." : "Save All Settings"}
        </button>
      </div>
    </form>
  );
}