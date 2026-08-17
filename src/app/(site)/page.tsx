import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { AiTools } from "@/components/home/ai-tools";
import { Skills } from "@/components/home/skills";
import { FeaturedCourse } from "@/components/home/featured-course";
import { WhyUs } from "@/components/home/why-us";
import { LearningProcess } from "@/components/home/learning-process";
import { LiveBatch } from "@/components/home/live-batch";
import { Products } from "@/components/home/products";
import { Testimonials } from "@/components/home/testimonials";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";

export const metadata = {
  title: "Plickify Academy | AI Skills, Freelancing ও ডিজিটাল ক্যারিয়ার",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <AiTools />
      <Skills />
      <FeaturedCourse />
      <WhyUs />
      <LearningProcess />
      <LiveBatch />
      <Products />
      <Testimonials />
      <Faq />
      <FinalCta />
    </>
  );
}