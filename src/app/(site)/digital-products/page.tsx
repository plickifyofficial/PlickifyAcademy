import type { Metadata } from "next";
import { ProductsBrowser } from "@/components/products/products-browser";
import { getPublishedProducts } from "@/lib/products";
import { getCategories, getPublishedFaqs } from "@/lib/content-modules";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/digital-products", {
    title: "Digital Products | Plickify Academy",
    description:
      "AI Prompt, Canva Templates, eBooks, Design Resources এবং Freelancing Tools — premium digital resources এক জায়গায়।",
  });
}

export const revalidate = 60;

export default async function DigitalProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const [{ q, category }, products, categories, faqItems] = await Promise.all([
    searchParams,
    getPublishedProducts(),
    getCategories("product"),
    getPublishedFaqs("products"),
  ]);

  return (
    <ProductsBrowser
      products={products}
      initialQuery={q ?? undefined}
      initialCategory={category ?? undefined}
      categories={categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        icon: c.icon ?? "fa-solid fa-tag",
        desc: c.description ?? "",
      }))}
      faqItems={faqItems.map((f) => ({ q: f.question, a: f.answer }))}
    />
  );
}