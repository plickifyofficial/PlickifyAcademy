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
      showToast("সাইট সেটিংস সেভ হয়েছে");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "সেভ করা যায়নি", "error");
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
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-6 lg:grid-cols-2"
    >
      <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-zinc-900">সাধারণ তথ্য</h3>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            সাইটের নাম
          </label>
          <input
            name="site_name"
            defaultValue={settings.site_name}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            ট্যাগলাইন
          </label>
          <input
            name="tagline"
            defaultValue={settings.tagline}
            placeholder="শেখো, বেড়ে উঠো"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-zinc-900">লোগো</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt="লোগো প্রিভিউ"
                className="h-full w-full object-contain"
              />
            ) : (
              <i className="fa-solid fa-image text-2xl text-zinc-300" />
            )}
          </div>
          <div className="flex-1">
            <label className="block cursor-pointer rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-center text-sm font-medium text-zinc-600 hover:border-indigo-400 hover:text-indigo-600">
              লোগো আপলোড করুন
              <input
                type="file"
                name="logo_file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => previewFile(e, setLogoPreview)}
              />
            </label>
            <p className="mt-2 text-xs text-zinc-400">
              PNG/JPG/WebP/SVG — সর্বোচ্চ 2MB
            </p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-zinc-900">ফেভিকন</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
            {faviconPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={faviconPreview}
                alt="ফেভিকন প্রিভিউ"
                className="h-full w-full object-contain"
              />
            ) : (
              <i className="fa-solid fa-globe text-2xl text-zinc-300" />
            )}
          </div>
          <div className="flex-1">
            <label className="block cursor-pointer rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-center text-sm font-medium text-zinc-600 hover:border-indigo-400 hover:text-indigo-600">
              ফেভিকন আপলোড করুন
              <input
                type="file"
                name="favicon_file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
                className="hidden"
                onChange={(e) => previewFile(e, setFaviconPreview)}
              />
            </label>
            <p className="mt-2 text-xs text-zinc-400">
              PNG (32×32 বা তার বেশি) / SVG — সর্বোচ্চ 2MB
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </button>
      </div>
    </form>
  );
}