import Link from "next/link";
import { PageHero } from "@/components/home/page-hero";
import { getSiteContent } from "@/lib/site-content";
import { footerDefaults } from "@/lib/content-schema";

export const metadata = {
  title: "Contact Us | Plickify Academy",
};

export const revalidate = 60;

export default async function ContactPage() {
  const footer = await getSiteContent("global.footer", footerDefaults);

  const cards = [
    {
      icon: "fa-solid fa-envelope",
      label: "Email Us",
      value: footer.email,
      href: `mailto:${footer.email}`,
    },
    {
      icon: "fa-solid fa-phone",
      label: "Call Us",
      value: footer.phone,
      href: `tel:${footer.phone.replace(/\s/g, "")}`,
    },
    {
      icon: "fa-solid fa-location-dot",
      label: "Address",
      value: footer.address,
      href: null,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="Get In Touch With Us"
        subtitle="Message us today for any questions, suggestions, or admission inquiries. Our team is always by your side."
      />

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          data-aos="fade-up"
        >
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-zinc-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-2xl text-white shadow-md shadow-brand-600/25">
                <i className={c.icon} />
              </span>
              <p className="mt-4 text-sm font-semibold text-zinc-400">
                {c.label}
              </p>
              {c.href ? (
                <a
                  href={c.href}
                  className="mt-1 inline-block break-all text-lg font-bold text-zinc-900 hover:text-brand-600"
                >
                  {c.value}
                </a>
              ) : (
                <p className="mt-1 text-lg font-bold text-zinc-900">
                  {c.value}
                </p>
              )}
            </div>
          ))}
        </div>

        <div
          className="mt-10 overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-xl shadow-brand-100/60"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center bg-gradient-to-br from-brand-800 via-brand-700 to-brand-500 p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200">
                Follow Us
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-white">
                Stay Connected on Social Media
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Follow us on all our social platforms to get new courses, updates, and free resources.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {footer.socials.map((s) => (
                  <a
                    key={s.icon}
                    href={s.href}
                    aria-label="Social link"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-xl text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-700"
                  >
                    <i className={s.icon} />
                  </a>
                ))}
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <h3 className="text-xl font-bold text-zinc-900">
                Send a Message
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Leave your email below and we'll contact you directly.
              </p>

              <form className="mt-6 space-y-4" action="/" aria-label="Contact">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-700">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your question or message..."
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  <i className="fa-solid fa-paper-plane text-xs" />
                  Send Message
                </button>
              </form>

              <p className="mt-5 rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-700">
                <i className="fa-solid fa-circle-info mr-1" />
                For quick answers to urgent matters, email {footer.email} directly or
                message us on our social pages.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link
            href="/signup"
            className="group block overflow-hidden rounded-[2rem] bg-brand-900 px-8 py-10 shadow-2xl shadow-brand-900/40 transition-transform hover:-translate-y-1 sm:px-14"
          >
            <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
                  Ready To Start?
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                  Start Your Learning Journey Today
                </h2>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-colors group-hover:bg-brand-500">
                Start Now
                <i className="fa-solid fa-arrow-right text-xs" />
              </span>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
