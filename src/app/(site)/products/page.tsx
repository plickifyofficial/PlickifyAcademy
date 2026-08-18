import { PageHero } from "@/components/home/page-hero";
import { Products } from "@/components/home/products";
import { FinalCta } from "@/components/home/final-cta";
import { getSiteContent } from "@/lib/site-content";
import { ctaDefaults, productsDefaults } from "@/lib/content-schema";

export const metadata = {
  title: "ডিজিটাল প্রোডাক্ট | Plickify Academy",
};

export const revalidate = 60;

export default async function ProductsPage() {
  const [products, cta] = await Promise.all([
    getSiteContent("home.products", productsDefaults),
    getSiteContent("home.cta", ctaDefaults),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Learning Products"
        title="প্রিমিয়াম ডিজিটাল রিসোর্স"
        subtitle="AI Tools, টেমপ্লেট, eBook ও আরও অনেক কিছু — শেখার জন্য প্রয়োজনীয় সব রিসোর্স এক জায়গায়।"
      />
      <Products content={products} hideViewAll />
      <FinalCta content={cta} />
    </>
  );
}
