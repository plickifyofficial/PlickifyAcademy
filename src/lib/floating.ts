import type {
  BusinessHour,
  ContactPlacement,
  ContactSettingsContent,
} from "@/lib/content-schema";

export function resolvePlacement(
  placement: ContactPlacement,
  pathname: string,
): boolean {
  if (!placement.all) return false;
  if (
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return false;
  }
  const path = pathname.split("?")[0];
  if (path === "/") return placement.home;
  if (
    path.startsWith("/courses") ||
    path.startsWith("/live-course") ||
    path.startsWith("/live-batch")
  ) {
    return placement.courses;
  }
  if (path.startsWith("/products") || path.startsWith("/digital-products")) {
    return placement.products;
  }
  if (path.startsWith("/blog")) return placement.blog;
  if (path.startsWith("/checkout")) return placement.checkout;
  if (path.startsWith("/dashboard")) return placement.dashboard;
  return placement.pages;
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const digits = number.replace(/[^\d]/g, "");
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildMessengerUrl(urlOrPageId: string): string {
  const value = urlOrPageId.trim();
  if (!value) return "https://m.me/";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://m.me/${value.replace(/^@/, "")}`;
}

function minutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function isChatOnline(
  settings: ContactSettingsContent,
  now: Date = new Date(),
): boolean {
  if (settings.availability !== "hours") return true;
  const hours: BusinessHour[] = Array.isArray(settings.businessHours)
    ? settings.businessHours
    : [];
  const today = hours.find((h) => h.day === now.getDay());
  if (!today || !today.enabled) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= minutes(today.open) && current < minutes(today.close);
}

export function formatBusinessHours(hours: BusinessHour[]): string {
  const enabled = hours.filter((h) => h.enabled);
  if (enabled.length === 0) return "Closed today";
  const first = enabled[0];
  const last = enabled[enabled.length - 1];
  return `${first.open} – ${last.close}`;
}