import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { AiTools } from "@/components/home/ai-tools";
import { Skills } from "@/components/home/skills";
import { FeaturedCourse } from "@/components/home/featured-course";
import { OurCourses } from "@/components/home/our-courses";
import { WhyUs } from "@/components/home/why-us";
import { LearningProcess } from "@/components/home/learning-process";
import { LiveBatch } from "@/components/home/live-batch";
import { Products } from "@/components/home/products";
import { Testimonials } from "@/components/home/testimonials";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { CustomSectionBlock } from "@/components/home/custom-section-block";
import {
  getSiteContent,
  readSiteContentWithDraft,
} from "@/lib/site-content";
import { getPublishedProducts } from "@/lib/products";
import { getPublishedFaqs, getPublishedTestimonials } from "@/lib/content-modules";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ctaDefaults,
  faqDefaults,
  featuredDefaults,
  heroDefaults,
  liveBatchDefaults,
  ourCoursesDefaults,
  processDefaults,
  productsDefaults,
  customSectionsDefaults,
  sectionsMetaDefaults,
  skillsDefaults,
  statsDefaults,
  testimonialsDefaults,
  toolsDefaults,
  whyDefaults,
} from "@/lib/content-schema";

export async function HomeSections({ useDrafts = false }: { useDrafts?: boolean }) {
  const read = <T,>(key: string, defaults: T) =>
    useDrafts
      ? readSiteContentWithDraft(key, defaults)
      : getSiteContent(key, defaults);

  const [hero, stats, tools, skills, featured, ourCourses, why, process, liveBatch, products, testimonials, faq, cta, dbProducts, dbTestimonials, dbFaqs, sectionsMeta, customSections, featuredCourse, featuredBatch] =
    await Promise.all([
      read("home.hero", heroDefaults),
      read("home.stats", statsDefaults),
      read("home.tools", toolsDefaults),
      read("home.skills", skillsDefaults),
      read("home.featured", featuredDefaults),
      read("home.our_courses", ourCoursesDefaults),
      read("home.why", whyDefaults),
      read("home.process", processDefaults),
      read("home.live_batch", liveBatchDefaults),
      read("home.products", productsDefaults),
      read("home.testimonials", testimonialsDefaults),
      read("home.faq", faqDefaults),
      read("home.cta", ctaDefaults),
      getPublishedProducts(),
      getPublishedTestimonials(),
      getPublishedFaqs("homepage"),
      read("home.sections_meta", sectionsMetaDefaults),
      read("home.custom_sections", customSectionsDefaults),
      (async () => {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from("courses")
          .select("*")
          .eq("is_featured", true)
          .eq("is_published", true)
          .order("updated_at", { ascending: false })
          .limit(1);
        return data?.[0] ?? null;
      })(),
      (async () => {
        const supabase = createAdminClient();
        const { data } = await supabase
          .from("batches")
          .select("*")
          .eq("is_featured", true)
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .limit(1);
        return data?.[0] ?? null;
      })(),
    ]);

  const testimonialItems = dbTestimonials.map((t) => ({
    name: t.name,
    role: t.role,
    quote: t.quote,
    initials: t.initials,
    color: t.color,
    rating: t.rating,
    course: t.course,
  }));
  const faqLimit = (faq as { limit?: number }).limit || 6;
  const faqItems = dbFaqs
    .map((f) => ({ q: f.question, a: f.answer }))
    .slice(0, faqLimit);

  const hiddenSet = new Set(sectionsMeta.hidden);
  const knownKeys = new Set(sectionsMetaDefaults.order);

  const orderedKeys = [
    ...sectionsMeta.order.filter((k) => knownKeys.has(k)),
    ...sectionsMetaDefaults.order.filter((k) => !sectionsMeta.order.includes(k)),
  ].filter((k) => !hiddenSet.has(k));

  // Tailwind visibility classes per device flags
  // (mobile <768px, tablet 768–1279px, desktop ≥1280px).
  function deviceClass(
    flags?: { desktop: boolean; tablet: boolean; mobile: boolean },
  ) {
    if (!flags) return "";
    const { desktop = true, tablet = true, mobile = true } = flags;
    if (desktop && tablet && mobile) return "";
    let cls = mobile ? "" : "hidden";
    if (tablet !== mobile) cls += ` md:${tablet ? "block" : "hidden"}`;
    if (desktop !== tablet) cls += ` xl:${desktop ? "block" : "hidden"}`;
    return cls.trim();
  }

  const sectionMap: Record<string, React.ReactNode> = {
    "home.hero": <Hero content={hero} />,
    "home.stats": <Stats content={stats} />,
    "home.tools": <AiTools content={tools} />,
    "home.skills": <Skills content={skills} />,
    "home.featured": <FeaturedCourse content={featured} course={featuredCourse} />,
    "home.our_courses": <OurCourses content={ourCourses} />,
    "home.why": <WhyUs content={why} />,
    "home.process": <LearningProcess content={process} />,
    "home.live_batch": <LiveBatch content={liveBatch} batch={featuredBatch} />,
    "home.products": <Products content={products} products={dbProducts} />,
    "home.testimonials": <Testimonials content={testimonials} items={testimonialItems} />,
    "home.faq": <Faq content={faq} items={faqItems} />,
    "home.cta": <FinalCta content={cta} />,
  };

  return (
    <>
      {orderedKeys.map((key) => {
        const cls = deviceClass(sectionsMeta.devices?.[key]);
        return (
          <div key={key} className={cls || undefined}>
            {sectionMap[key]}
          </div>
        );
      })}
      {customSections.items
        .filter((s) => s.visible)
        .map((s) => (
          <CustomSectionBlock key={s.id} section={s} />
        ))}
    </>
  );
}
