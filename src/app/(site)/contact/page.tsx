import Link from "next/link";
import type { Metadata } from "next";
import { Faq } from "@/components/home/faq";
import { ContactForm } from "@/components/contact/contact-form";
import { getSiteContent } from "@/lib/site-content";
import { getPublishedFaqs } from "@/lib/content-modules";
import { contactDefaults, type ContactContent } from "@/lib/content-schema";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/contact", {
    title: "Contact Us | Plickify Academy",
    description:
      "কোর্স, ভর্তি, পেমেন্ট, ডিজিটাল প্রোডাক্ট অথবা যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন।",
  });
}

export const revalidate = 60;

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
      {children}
    </span>
  );
}

export default async function ContactPage() {
  const [content, dbFaqs] = await Promise.all([
    getSiteContent("contact", contactDefaults) as Promise<ContactContent>,
    getPublishedFaqs("contact"),
  ]);

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-10 pt-16 sm:px-6 sm:pt-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="mx-auto max-w-3xl text-center" data-aos="fade-up">
          <SectionLabel>{content.heroEyebrow}</SectionLabel>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-zinc-900 sm:text-5xl">
            {content.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-500 sm:text-lg">
            {content.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Quick contact cards */}
      <section className="px-4 pb-14 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(content.cards ?? []).map((c, i) => (
            <a
              key={c.title}
              href={c.href}
              className="group rounded-2xl border border-zinc-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-brand-100 hover:shadow-lg hover:shadow-brand-100"
              data-aos="fade-up"
              data-aos-delay={i * 60}
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <i className={c.icon} />
              </span>
              <p className="mt-3 text-sm font-semibold text-zinc-400">
                {c.title}
              </p>
              <p className="mt-0.5 break-all font-bold text-zinc-900">
                {c.value}
              </p>
              <p className="mt-1 text-xs text-zinc-400">{c.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors group-hover:text-brand-700">
                {c.action}
                <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Main contact: info + form */}
      <section className="bg-[#F5F9FF] px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[45%_1fr]">
          {/* Left info */}
          <div data-aos="fade-up">
            <SectionLabel>{content.infoLabel}</SectionLabel>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.infoTitle}
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-500">
              {content.infoDesc}
            </p>

            <div className="mt-8 space-y-4">
              <InfoRow
                icon="fa-solid fa-envelope"
                label="Email"
                value={content.email}
                href={`mailto:${content.email}`}
              />
              <InfoRow
                icon="fa-solid fa-headset"
                label="Support"
                value={content.supportEmail}
                href={`mailto:${content.supportEmail}`}
              />
              <InfoRow
                icon="fa-solid fa-phone"
                label="Phone"
                value={content.phone}
                href={`tel:${(content.phone ?? "").replace(/\s/g, "")}`}
              />
              <div className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <i className="fa-solid fa-clock" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-zinc-400">
                    {content.hoursTitle}
                  </p>
                  {(content.hours ?? []).map((h) => (
                    <p key={h} className="font-bold text-zinc-900">
                      {h}
                    </p>
                  ))}
                </div>
              </div>
              <InfoRow
                icon="fa-solid fa-location-dot"
                label={content.locationTitle}
                value={content.location}
              />
            </div>

            {/* Priority support */}
            <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-brand-900 p-6 text-white">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand-300">
                <i className="fa-solid fa-circle-exclamation" />
                {content.priorityTitle}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                {content.priorityDesc}
              </p>
              <a
                href={content.priorityButtonLink}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
              >
                {content.priorityButton}
                <i className="fa-solid fa-arrow-right text-xs" />
              </a>
            </div>

            {/* Social */}
            <div className="mt-8">
              <p className="font-bold text-zinc-900">{content.socialTitle}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(content.socials ?? []).map((s) => (
                  <a
                    key={s.icon}
                    href={s.href}
                    aria-label="Social link"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
                  >
                    <i className={s.icon} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right form */}
          <div id="contact-form" data-aos="fade-up" data-aos-delay="100">
            <ContactForm content={content} />
          </div>
        </div>
      </section>

      {/* Quick help */}
      <section className="bg-zinc-50/70 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl text-center" data-aos="fade-up">
          <SectionLabel>{content.helpLabel}</SectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
            {content.helpTitle}
          </h2>
          <p className="mt-3 text-zinc-500">{content.helpDesc}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={content.helpPrimaryLink}
              className="rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700"
            >
              {content.helpPrimary}
            </Link>
            <Link
              href={content.helpSecondaryLink}
              className="rounded-full border border-zinc-200 bg-white px-8 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-300 hover:text-brand-600"
            >
              {content.helpSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Faq
        content={{
          title: content.faqTitle,
          items: (content.faqItems ?? []).map((f) => ({ q: f.q, a: f.a })),
        }}
        items={dbFaqs.map((f) => ({ q: f.question, a: f.answer }))}
      />

      {/* Map */}
      <section id="map" className="bg-[#F5F9FF] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl" data-aos="fade-up">
          <div className="text-center">
            <SectionLabel>{content.mapLabel}</SectionLabel>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.mapTitle}
            </h2>
            <p className="mt-2 text-zinc-500">{content.mapLocation}</p>
          </div>
          <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg">
            <iframe
              src={content.mapEmbedUrl}
              title="Plickify Academy location"
              className="h-[380px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Support channels */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center" data-aos="fade-up">
            <SectionLabel>{content.channelsLabel}</SectionLabel>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
              {content.channelsTitle}
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(content.channels ?? []).map((ch, i) => (
              <a
                key={ch.title}
                href={ch.href}
                className="group rounded-2xl border border-zinc-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-brand-100 hover:shadow-lg hover:shadow-brand-100"
                data-aos="fade-up"
                data-aos-delay={i * 60}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-xl text-white shadow-lg shadow-brand-600/30">
                  <i className={ch.icon} />
                </div>
                <h3 className="mt-4 font-bold text-zinc-900">{ch.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{ch.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  Contact
                  <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0b1a3a] to-brand-900 px-6 py-16 text-center sm:px-12">
          <div data-aos="zoom-in">
            <span className="text-xs font-bold tracking-[0.25em] text-brand-300">
              {content.ctaEyebrow}
            </span>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
              {content.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-300">
              {content.ctaSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={content.ctaPrimaryLink}
                className="rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
              >
                {content.ctaPrimary}
              </Link>
              <Link
                href={content.ctaSecondaryLink}
                className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {content.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <i className={icon} />
      </span>
      <div>
        <p className="text-xs font-semibold text-zinc-400">{label}</p>
        {href ? (
          <a
            href={href}
            className="break-all font-bold text-zinc-900 hover:text-brand-600"
          >
            {value}
          </a>
        ) : (
          <p className="font-bold text-zinc-900">{value}</p>
        )}
      </div>
    </div>
  );
}