import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = { title: "System" };

export default async function AdminSystemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();

  const [
    { count: courses },
    { count: lessons },
    { count: students },
    { count: enrollments },
    { count: orders },
    { count: products },
    { count: posts },
    { count: subscribers },
    { count: messages },
    { count: categories },
    { count: faqs },
    { count: testimonials },
    { count: batches },
    { count: instructors },
    { data: paidOrders },
    settings,
  ] = await Promise.all([
    admin.from("courses").select("id", { count: "exact", head: true }),
    admin.from("lessons").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    admin.from("enrollments").select("id", { count: "exact", head: true }),
    admin.from("orders").select("id", { count: "exact", head: true }),
    admin.from("products").select("id", { count: "exact", head: true }),
    admin.from("blog_posts").select("id", { count: "exact", head: true }),
    admin.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("contact_messages").select("id", { count: "exact", head: true }),
    admin.from("categories").select("id", { count: "exact", head: true }),
    admin.from("faqs").select("id", { count: "exact", head: true }),
    admin.from("testimonials").select("id", { count: "exact", head: true }),
    admin.from("batches").select("id", { count: "exact", head: true }),
    admin.from("instructors").select("id", { count: "exact", head: true }),
    admin.from("orders").select("amount").eq("status", "paid"),
    getSiteSettings(),
  ]);

  const revenue = (paidOrders ?? []).reduce(
    (sum, o) => sum + Number(o.amount),
    0,
  );

  async function bucketStats(bucket: string) {
    try {
      const { data, error } = await admin.storage.from(bucket).list("", {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) return { files: 0, bytes: 0 };
      return {
        files: data.length,
        bytes: data.reduce((sum, f) => sum + (f.metadata?.size ?? 0), 0),
      };
    } catch {
      return { files: 0, bytes: 0 };
    }
  }

  const [siteAssets, courseImages, productFiles] = await Promise.all([
    bucketStats("site-assets"),
    bucketStats("course-images"),
    bucketStats("product-files"),
  ]);

  const storageBytes = siteAssets.bytes + courseImages.bytes + productFiles.bytes;
  const storageFiles = siteAssets.files + courseImages.files + productFiles.files;

  function mb(bytes: number) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  const countRows = [
    { label: "Courses", value: courses ?? 0, icon: "fa-solid fa-book-open" },
    { label: "Lessons / Topics", value: lessons ?? 0, icon: "fa-solid fa-file-lines" },
    { label: "Students", value: students ?? 0, icon: "fa-solid fa-users" },
    { label: "Enrollments", value: enrollments ?? 0, icon: "fa-solid fa-user-check" },
    { label: "Orders", value: orders ?? 0, icon: "fa-solid fa-cart-shopping" },
    { label: "Digital Products", value: products ?? 0, icon: "fa-solid fa-cube" },
    { label: "Blog Posts", value: posts ?? 0, icon: "fa-solid fa-blog" },
    { label: "Newsletter Subscribers", value: subscribers ?? 0, icon: "fa-solid fa-envelope-open-text" },
    { label: "Contact Messages", value: messages ?? 0, icon: "fa-solid fa-envelope" },
    { label: "Categories", value: categories ?? 0, icon: "fa-solid fa-folder" },
    { label: "FAQs", value: faqs ?? 0, icon: "fa-solid fa-circle-question" },
    { label: "Testimonials", value: testimonials ?? 0, icon: "fa-solid fa-quote-right" },
    { label: "Live Batches", value: batches ?? 0, icon: "fa-solid fa-calendar-days" },
    { label: "Instructors", value: instructors ?? 0, icon: "fa-solid fa-chalkboard-user" },
  ];

  return (
    <div>
      <h1 className="wp-page-title">System Status</h1>
      <p className="wp-subtitle">Overall health and data overview of Plickify Academy.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="wp-panel">
          <div className="wp-panel-body">
            <p className="text-sm text-[#646970]">Site</p>
            <p className="mt-1 text-lg font-bold text-[#1d2327]">
              {settings?.site_name || "Plickify Academy"}
            </p>
            <p className="mt-1 text-xs text-[#646970]">
              {settings?.tagline || "—"}
            </p>
          </div>
        </div>
        <div className="wp-panel">
          <div className="wp-panel-body">
            <p className="text-sm text-[#646970]">Paid Revenue</p>
            <p className="mt-1 text-lg font-bold text-[#1d2327]">
              ৳{revenue.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-[#646970]">
              across {orders ?? 0} total orders
            </p>
          </div>
        </div>
        <div className="wp-panel">
          <div className="wp-panel-body">
            <p className="text-sm text-[#646970]">Maintenance Mode</p>
            <p className="mt-1">
              <span
                className={`wp-tag border-0 ${settings?.maintenance_mode ? "wp-tag-red" : "wp-tag-green"}`}
              >
                {settings?.maintenance_mode ? "ON" : "OFF"}
              </span>
            </p>
            <p className="mt-1 text-xs text-[#646970]">
              Settings last updated{" "}
              {settings?.updated_at
                ? new Date(settings.updated_at).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
        <div className="wp-panel">
          <div className="wp-panel-body">
            <p className="text-sm text-[#646970]">Storage</p>
            <p className="mt-1 text-lg font-bold text-[#1d2327]">
              {mb(storageBytes)}
            </p>
            <p className="mt-1 text-xs text-[#646970]">{storageFiles} files</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="wp-panel lg:col-span-2">
          <div className="wp-panel-header">
            <i className="fa-solid fa-database text-[#2271b1]" /> Database Records
          </div>
          <div className="wp-panel-body">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {countRows.map((row) => (
                <div key={row.label} className="rounded-lg border border-[#e2e4e7] bg-[#f6f7f7] p-3">
                  <div className="flex items-center gap-2 text-[#2271b1]">
                    <i className={row.icon} />
                    <span className="text-xl font-bold text-[#1d2327]">
                      {row.value}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#646970]">{row.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="wp-panel">
          <div className="wp-panel-header">
            <i className="fa-solid fa-boxes-stacked text-[#2271b1]" /> Storage Buckets
          </div>
          <div className="wp-panel-body space-y-3">
            {[
              { name: "site-assets", ...siteAssets },
              { name: "course-images", ...courseImages },
              { name: "product-files", ...productFiles },
            ].map((b) => (
              <div
                key={b.name}
                className="flex items-center justify-between rounded-lg border border-[#e2e4e7] bg-[#f6f7f7] px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1d2327]">{b.name}</p>
                  <p className="text-xs text-[#646970]">{b.files} files</p>
                </div>
                <span className="wp-tag wp-tag-gray">{mb(b.bytes)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}