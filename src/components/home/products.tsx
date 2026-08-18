import Link from "next/link";
import type { ProductsContent } from "@/lib/content-schema";

export function Products({ content }: { content: ProductsContent }) {
  return (
    <section id="products" className="bg-zinc-50/70 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center" data-aos="fade-up">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            {content.eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
            {content.title}
          </h2>
        </div>

        <div
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {content.items.map((product) => (
            <div
              key={product.name}
              className="group overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-100"
            >
              <div
                className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${product.gradient}`}
              >
                <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white backdrop-blur">
                  {product.tag}
                </span>
                <i className={`${product.icon} text-5xl text-white/85`} />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-zinc-900">{product.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-brand-600">
                    {product.price}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-zinc-400 line-through">
                      {product.oldPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center" data-aos="fade-up">
          <Link
            href={content.viewAllLink || "/#contact"}
            className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-white px-7 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            {content.viewAllText}
            <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>
      </div>
    </section>
  );
}
