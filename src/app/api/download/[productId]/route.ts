import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyDownloadToken } from "@/lib/product-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function contentTypeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    svg: "image/svg+xml",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    fig: "application/octet-stream",
    psd: "application/octet-stream",
    ai: "application/octet-stream",
  };
  return map[ext] ?? "application/octet-stream";
}

function filenameFromUrl(url: string, fallback: string): string {
  try {
    const path = new URL(url).pathname;
    const name = path.split("/").filter(Boolean).pop();
    return name ? decodeURIComponent(name) : fallback;
  } catch {
    return fallback;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("t") ?? "";

  if (!verifyDownloadToken(token, productId)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: purchase } = await supabase
    .from("product_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();
  if (!purchase) return new Response("Forbidden", { status: 403 });

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("name, file_url, download_count")
    .eq("id", productId)
    .single();
  if (!product?.file_url) return new Response("Not found", { status: 404 });

  let sourceUrl = product.file_url;
  if (!/^https?:\/\//i.test(sourceUrl)) {
    const { data: signed } = await admin.storage
      .from("product-files")
      .createSignedUrl(sourceUrl, 3600);
    if (!signed?.signedUrl) return new Response("File unavailable", { status: 502 });
    sourceUrl = signed.signedUrl;
  }

  const range = req.headers.get("range");
  const upstream = await fetch(sourceUrl, {
    headers: range ? { Range: range } : undefined,
  });
  if (!upstream.ok && upstream.status !== 206) {
    return new Response("File unavailable", { status: 502 });
  }

  const filename = filenameFromUrl(product.file_url, `${product.name}.zip`);

  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") || contentTypeFromName(filename),
  );
  headers.set(
    "Content-Disposition",
    `attachment; filename="${filename.replace(/"/g, "")}"`,
  );
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("X-Content-Type-Options", "nosniff");

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  if (upstream.status === 206 && range) {
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);
    headers.set("Accept-Ranges", "bytes");
  }

  try {
    await admin
      .from("products")
      .update({ download_count: (product.download_count ?? 0) + 1 })
      .eq("id", productId);
  } catch {
    // non-critical
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}