import { createClient } from "@/lib/supabase/server";
import { verifyVideoToken } from "@/lib/video-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> },
) {
  const { courseId, lessonId } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("t") ?? "";

  if (!verifyVideoToken(token, courseId, lessonId)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!enrollment) return new Response("Forbidden", { status: 403 });

  const { data: lesson } = await supabase
    .from("lessons")
    .select("video_url")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .single();
  if (!lesson?.video_url) return new Response("Not found", { status: 404 });

  const range = req.headers.get("range");
  const upstream = await fetch(lesson.video_url, {
    headers: range ? { Range: range } : undefined,
  });
  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Video unavailable", { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || "video/mp4");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Disposition", 'inline; filename="video.mp4"');
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("X-Content-Type-Options", "nosniff");

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  if (upstream.status === 206 && range) {
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}