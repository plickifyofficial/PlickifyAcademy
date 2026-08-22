import type { Metadata } from "next";
import { getSiteContent } from "@/lib/site-content";

export const SEO_PAGES: { path: string; label: string }[] = [
  { path: "/", label: "Homepage" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
  { path: "/courses", label: "All Courses" },
  { path: "/digital-products", label: "Digital Products" },
  { path: "/faq", label: "FAQ" },
  { path: "/live-batch", label: "Live Batch" },
  { path: "/live-batch", label: "Live Batch" },
  { path: "/privacy", label: "Privacy Policy" },
  { path: "/products", label: "Products" },
  { path: "/refund", label: "Refund Policy" },
  { path: "/terms", label: "Terms & Conditions" },
];

export type SeoPageOverride = { title?: string; description?: string };
export type SeoOverrides = Record<string, SeoPageOverride>;

const SEO_OVERRIDES_KEY = "global.seo_overrides";

export async function getSeoOverrides(): Promise<SeoOverrides> {
  return getSiteContent(SEO_OVERRIDES_KEY, {});
}

/** Merge an admin SEO override over a page's built-in metadata. */
export async function pageMetadata(
  path: string,
  fallback: Metadata,
): Promise<Metadata> {
  const overrides = await getSeoOverrides();
  const o = overrides[path];
  if (!o) return fallback;
  return {
    ...fallback,
    title: o.title?.trim() || fallback.title,
    description: o.description?.trim() || fallback.description,
  };
}
