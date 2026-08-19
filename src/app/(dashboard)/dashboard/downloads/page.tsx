import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Download History" };

export default async function DownloadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: logsRaw } = await supabase
    .from("download_logs")
    .select(
      "id, file_name, created_at, product_id, resource_id, products(name, slug), lesson_resources(title, lesson_id, lessons(course_id))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const logs = (logsRaw ?? []) as unknown as Array<{
    id: string;
    file_name: string;
    created_at: string;
    product_id: string | null;
    resource_id: string | null;
    products: { name: string; slug: string } | null;
    lesson_resources: {
      title: string;
      lesson_id: string;
      lessons: { course_id: string } | null;
    } | null;
  }>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900">Download History</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Files you have downloaded from digital products and course lessons.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl text-zinc-400">
            <i className="fa-solid fa-download" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">
            No downloads yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
            When you download a digital product or lesson file, it will be
            recorded here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <ul className="divide-y divide-zinc-100">
            {logs.map((log) => {
              const product = log.product_id ? log.products : null;
              const resource = log.resource_id ? log.lesson_resources : null;
              const link = product
                ? `/digital-products/${product.slug}`
                : resource
                  ? `/dashboard/learn/${resource.lessons?.course_id ?? ""}/${resource.lesson_id}`
                  : null;
              return (
                <li key={log.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <i className="fa-solid fa-file-arrow-down" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {product?.name ?? resource?.title ?? log.file_name}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-zinc-500">
                      <span className="truncate font-mono text-[11px] text-zinc-400">
                        {log.file_name}
                      </span>
                      <span>
                        {product ? "Digital Product" : "Lesson Resource"}
                      </span>
                      <span>
                        {new Date(log.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>
                  {link && (
                    <Link
                      href={link}
                      className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                    >
                      View
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}