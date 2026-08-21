import type { Metadata } from "next";
import { HomeSections } from "@/components/home/home-sections";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/", {
    title: "Plickify Academy | AI Skills, Freelancing & Digital Career",
  });
}

export default function HomePage() {
  return <HomeSections />;
}
