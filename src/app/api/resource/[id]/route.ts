import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

function filenameFromPath(path: string, fallback: string): string {
  const name = path.split("/").filter(Boolean).pop();
  return name ? decodeURIComponent(name) : fallback;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: resource } = await supabase
    .from("lesson_resources")
    .select("title, file_path, lesson_id, lessons(course_id)")
    .eq("id", id)
    .maybeSingle();
  if (!resource) return new Response("Not found", { status: 404 });

  const lesson = resource.lessons as unknown as { course_id: string } | null;
  if (!lesson) return new Response("Not found", { status: 404 });

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", lesson.course_id)
    .maybeSingle();
  if (!enrollment) return new Response("Forbidden", { status: 403 });

  const admin = createAdminClient();
  const { data: signed } = await admin.storage
    .from("lesson-resources")
    .createSignedUrl(resource.file_path, 3600);
  if (!signed?.signedUrl) return new Response("File unavailable", { status: 502 });

  const range = req.headers.get("range");
  const upstream = await fetch(signed.signedUrl, {
    headers: range ? { Range: range } : undefined,
  });
  if (!upstream.ok && upstream.status !== 206) {
    return new Response("File unavailable", { status: 502 });
  }

  const filename = filenameFromPath(resource.file_path, resource.title);

  try {
    await admin.from("download_logs").insert({
      user_id: user.id,
      resource_id: id,
      file_name: filename,
    });
  } catch {
    // non-critical
  }

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

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}