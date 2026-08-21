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
import { getSiteContent } from "@/lib/site-content";
import { getPublishedProducts } from "@/lib/products";
import { getPublishedFaqs, getPublishedTestimonials } from "@/lib/content-modules";
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

export const metadata = {
  title: "Plickify Academy | AI Skills, Freelancing & Digital Career",
};

export default async function HomePage() {
  const [hero, stats, tools, skills, featured, ourCourses, why, process, liveBatch, products, testimonials, faq, cta, dbProducts, dbTestimonials, dbFaqs, sectionsMeta, customSections] =
    await Promise.all([
      getSiteContent("home.hero", heroDefaults),
      getSiteContent("home.stats", statsDefaults),
      getSiteContent("home.tools", toolsDefaults),
      getSiteContent("home.skills", skillsDefaults),
      getSiteContent("home.featured", featuredDefaults),
      getSiteContent("home.our_courses", ourCoursesDefaults),
      getSiteContent("home.why", whyDefaults),
      getSiteContent("home.process", processDefaults),
      getSiteContent("home.live_batch", liveBatchDefaults),
      getSiteContent("home.products", productsDefaults),
      getSiteContent("home.testimonials", testimonialsDefaults),
      getSiteContent("home.faq", faqDefaults),
      getSiteContent("home.cta", ctaDefaults),
      getPublishedProducts(),
      getPublishedTestimonials(),
      getPublishedFaqs("homepage"),
      getSiteContent("home.sections_meta", sectionsMetaDefaults),
      getSiteContent("home.custom_sections", customSectionsDefaults),
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
  const faqItems = dbFaqs.map((f) => ({ q: f.question, a: f.answer }));

  const hiddenSet = new Set(sectionsMeta.hidden);
  const knownKeys = new Set(sectionsMetaDefaults.order);

  const orderedKeys = [
    ...sectionsMeta.order.filter((k) => knownKeys.has(k)),
    ...sectionsMetaDefaults.order.filter((k) => !sectionsMeta.order.includes(k)),
  ].filter((k) => !hiddenSet.has(k));

  const sectionMap: Record<string, React.ReactNode> = {
    "home.hero": <Hero content={hero} />,
    "home.stats": <Stats content={stats} />,
    "home.tools": <AiTools content={tools} />,
    "home.skills": <Skills content={skills} />,
    "home.featured": <FeaturedCourse content={featured} />,
    "home.our_courses": <OurCourses content={ourCourses} />,
    "home.why": <WhyUs content={why} />,
    "home.process": <LearningProcess content={process} />,
    "home.live_batch": <LiveBatch content={liveBatch} />,
    "home.products": <Products content={products} products={dbProducts} />,
    "home.testimonials": <Testimonials content={testimonials} items={testimonialItems} />,
    "home.faq": <Faq content={faq} items={faqItems} />,
    "home.cta": <FinalCta content={cta} />,
  };

  return (
    <>
      {orderedKeys.map((key) => (
        <div key={key}>{sectionMap[key]}</div>
      ))}
      {customSections.items
        .filter((s) => s.visible)
        .map((s) => (
          <CustomSectionBlock key={s.id} section={s} />
        ))}
    </>
  );
}
