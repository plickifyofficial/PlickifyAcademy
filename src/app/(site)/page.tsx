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
  const [hero, stats, tools, skills, featured, ourCourses, why, process, liveBatch, products, testimonials, faq, cta, dbProducts, dbTestimonials, dbFaqs] =
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
    ]);

  return (
    <>
      <Hero content={hero} />
      <Stats content={stats} />
      <AiTools content={tools} />
      <Skills content={skills} />
      <FeaturedCourse content={featured} />
      <OurCourses content={ourCourses} />
      <WhyUs content={why} />
      <LearningProcess content={process} />
      <LiveBatch content={liveBatch} />
      <Products content={products} products={dbProducts} />
      <Testimonials
        content={testimonials}
        items={dbTestimonials.map((t) => ({
          name: t.name,
          role: t.role,
          quote: t.quote,
          initials: t.initials,
          color: t.color,
          rating: t.rating,
          course: t.course,
        }))}
      />
      <Faq
        content={faq}
        items={dbFaqs.map((f) => ({ q: f.question, a: f.answer }))}
      />
      <FinalCta content={cta} />
    </>
  );
}
