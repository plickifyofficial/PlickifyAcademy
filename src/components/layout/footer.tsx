import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const quickLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/#live-batch", label: "Live Batch" },
  { href: "/#products", label: "Digital Products" },
  { href: "/#contact", label: "Become Instructor" },
  { href: "/#contact", label: "Blog" },
];

const supportLinks = [
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact Us" },
  { href: "/#contact", label: "Terms & Conditions" },
  { href: "/#contact", label: "Privacy Policy" },
  { href: "/#contact", label: "Refund Policy" },
];

const socials = [
  { icon: "fa-brands fa-facebook-f", href: "#" },
  { icon: "fa-brands fa-youtube", href: "#" },
  { icon: "fa-brands fa-linkedin-in", href: "#" },
  { icon: "fa-brands fa-instagram", href: "#" },
];

export async function Footer() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("site_name, logo_url")
    .eq("id", 1)
    .single();

  const siteName = settings?.site_name || "Plickify Academy";

  return (
    <footer id="contact" className="bg-brand-900 text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <div className="flex items-center gap-2.5">
              {settings?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logo_url}
                  alt={siteName}
                  className="h-9 w-auto max-w-[180px] object-contain"
                />
              ) : (
                <>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800">
                    <i className="fa-solid fa-graduation-cap text-white" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-lg font-extrabold text-white">
                      Plickify
                    </span>
                    <span className="-mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-brand-300">
                      Academy
                    </span>
                  </span>
                </>
              )}
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-400">
              AI, Freelancing এবং Digital Skills শেখার জন্য একটি practical
              learning platform।
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  aria-label="সোশ্যাল লিংক"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-zinc-300 transition-colors hover:bg-brand-600 hover:text-white"
                >
                  <i className={`${s.icon} text-sm`} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-zinc-400 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Support
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-zinc-400 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact Us
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-zinc-400">
              <li>
                <a href="mailto:hello@plickifyacademy.com" className="flex items-center gap-2.5 hover:text-white">
                  <i className="fa-solid fa-envelope text-brand-400" />
                  hello@plickifyacademy.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fa-solid fa-phone text-brand-400" />
                +880 1234-567890
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fa-solid fa-location-dot text-brand-400" />
                Dhaka, Bangladesh
              </li>
            </ul>

            <form className="mt-6" action="/" aria-label="নিউজলেটার">
              <p className="text-sm font-semibold text-white">
                সর্বশেষ আপডেট পেতে সাবস্ক্রাইব করুন
              </p>
              <div className="mt-3 flex overflow-hidden rounded-full border border-white/15 bg-white/5">
                <input
                  type="email"
                  required
                  placeholder="আপনার ইমেইল"
                  className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
                >
                  সাবস্ক্রাইব
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-500">
            © 2026 Plickify Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-zinc-500">
            <span className="flex h-7 w-10 items-center justify-center rounded border border-white/10 bg-white/5 text-[10px] font-bold text-zinc-400">
              VISA
            </span>
            <span className="flex h-7 w-10 items-center justify-center rounded border border-white/10 bg-white/5 text-[10px] font-bold text-zinc-400">
              MC
            </span>
            <span className="flex h-7 w-10 items-center justify-center rounded border border-white/10 bg-white/5 text-[10px] font-bold text-zinc-400">
              BKASH
            </span>
            <span className="flex h-7 w-10 items-center justify-center rounded border border-white/10 bg-white/5 text-[10px] font-bold text-zinc-400">
              NAGAD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}