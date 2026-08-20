import Link from "next/link";
import { formatPrice } from "@/lib/format";

type CourseLike = {
  title: string;
  slug: string;
  price: number;
  cover_image: string | null;
  category: string | null;
  description: string | null;
};

type ProductLike = {
  name: string;
  slug: string;
  price: number;
  old_price: number | null;
  cover_image: string | null;
  icon: string | null;
  gradient: string | null;
};

export function CourseRecommendation({ course }: { course: CourseLike }) {
  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900 sm:h-auto sm:w-56">
          {course.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.cover_image}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <i className="fa-solid fa-graduation-cap text-5xl text-white/70" />
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Related Course
          </p>
          <h3 className="mt-1 text-xl font-extrabold text-zinc-900">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
            {course.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-lg font-extrabold text-brand-600">
              {course.price <= 0 ? "Free" : formatPrice(course.price)}
            </span>
            <Link
              href={`/courses/${course.slug}`}
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              View Course →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductRecommendation({ product }: { product: ProductLike }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div
          className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br ${
            product.gradient || "from-blue-600 to-indigo-600"
          } sm:h-auto sm:w-40`}
        >
          {product.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.cover_image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <i
              className={`${product.icon || "fa-solid fa-file-lines"} text-5xl text-white/80`}
            />
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Recommended Resource
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-zinc-900">{product.name}</h3>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-brand-600">
                {product.price <= 0 ? "Free" : formatPrice(product.price)}
              </span>
              {product.old_price != null && product.old_price > product.price && (
                <span className="text-sm text-zinc-400 line-through">
                  {formatPrice(product.old_price)}
                </span>
              )}
            </div>
            <Link
              href={`/digital-products/${product.slug}`}
              className="rounded-full border-2 border-brand-600 px-5 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-600 hover:text-white"
            >
              View Product →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}