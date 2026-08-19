import { ProductsBrowser } from "@/components/products/products-browser";
import { getPublishedProducts } from "@/lib/products";

export const metadata = {
  title: "Digital Products | Plickify Academy",
  description:
    "AI Prompt, Canva Templates, eBooks, Design Resources এবং Freelancing Tools — premium digital resources এক জায়গায়।",
};

export const revalidate = 60;

export default async function DigitalProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const [{ q, category }, products] = await Promise.all([
    searchParams,
    getPublishedProducts(),
  ]);

  return (
    <ProductsBrowser
      products={products}
      initialQuery={q ?? undefined}
      initialCategory={category ?? undefined}
    />
  );
}