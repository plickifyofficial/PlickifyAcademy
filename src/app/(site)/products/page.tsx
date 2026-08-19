import { PageHero } from "@/components/home/page-hero";
import { Products } from "@/components/home/products";
import { FinalCta } from "@/components/home/final-cta";
import { getSiteContent } from "@/lib/site-content";
import { getPublishedProducts } from "@/lib/products";
import { ctaDefaults, productsDefaults } from "@/lib/content-schema";

export const metadata = {
  title: "Digital Products | Plickify Academy",
};

export const revalidate = 60;

export default async function ProductsPage() {
  const [products, cta, dbProducts] = await Promise.all([
    getSiteContent("home.products", productsDefaults),
    getSiteContent("home.cta", ctaDefaults),
    getPublishedProducts(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Learning Products"
        title="Premium Digital Resources"
        subtitle="AI Tools, templates, eBooks, and much more — every resource you need for learning, all in one place."
      />
      <Products content={products} products={dbProducts} hideViewAll />
      <FinalCta content={cta} />
    </>
  );
}
