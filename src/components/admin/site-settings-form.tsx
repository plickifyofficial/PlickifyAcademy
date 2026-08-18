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
};

export function SiteSettingsForm({ settings }: { settings: Settings }) {
  const [logoPreview, setLogoPreview] = useState<string | null>(
    settings.logo_url,
  );
  const [faviconPreview, setFaviconPreview] = useState<string | null>(
    settings.favicon_url,
  );
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

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="wp-panel">
        <div className="wp-panel-header">
          <i className="fa-solid fa-circle-info text-[#2271b1]" /> General Info
        </div>
        <div className="wp-panel-body space-y-4">
          <div>
            <label className="wp-label">Site Name</label>
            <input
              name="site_name"
              defaultValue={settings.site_name}
              className="wp-input"
            />
          </div>
          <div>
            <label className="wp-label">Tagline</label>
            <input
              name="tagline"
              defaultValue={settings.tagline}
              placeholder="Learn, grow up"
              className="wp-input"
            />
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
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-full w-full object-contain"
                  />
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
                <p className="mt-2 text-xs text-[#646970]">
                  PNG/JPG/WebP/SVG — max 2MB
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="wp-label">Favicon</label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-[#c3c4c7] bg-[#f0f0f1]">
                {faviconPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={faviconPreview}
                    alt="Favicon preview"
                    className="h-full w-full object-contain"
                  />
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
                <p className="mt-2 text-xs text-[#646970]">
                  PNG (32×32 or larger) / SVG — max 2MB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="wp-btn wp-btn-primary"
        >
          <i className="fa-solid fa-floppy-disk" />
          {pending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}