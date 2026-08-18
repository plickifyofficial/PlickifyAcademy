import "server-only";
import { createHmac, createHash, timingSafeEqual } from "crypto";
import { buildVideoRender, type VideoRender } from "@/lib/video";

const TOKEN_TTL_SECONDS = 60 * 60;

function videoSecret(): Buffer {
  const parts = [
    process.env.VIDEO_SIGN_SECRET,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ].filter(Boolean);
  return createHash("sha256")
    .update(parts.join("::") || "plickify-video-sign-v1")
    .digest();
}

export function signVideoToken(
  courseId: string,
  lessonId: string,
  exp = Date.now() + TOKEN_TTL_SECONDS * 1000,
): string {
  const sig = createHmac("sha256", videoSecret())
    .update(`${courseId}.${lessonId}.${exp}`)
    .digest("base64url");
  return Buffer.from(`${exp}.${courseId}.${lessonId}.${sig}`).toString(
    "base64url",
  );
}

export function verifyVideoToken(
  token: string,
  courseId: string,
  lessonId: string,
): boolean {
  try {
    const raw = Buffer.from(token, "base64url").toString();
    const [exp, cid, lid, sig] = raw.split(".");
    if (!exp || !cid || !lid || !sig) return false;
    if (cid !== courseId || lid !== lessonId) return false;
    if (Number(exp) < Date.now()) return false;
    const expected = createHmac("sha256", videoSecret())
      .update(`${cid}.${lid}.${exp}`)
      .digest();
    const provided = Buffer.from(sig, "base64url");
    if (provided.length !== expected.length) return false;
    return timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}

export function buildProtectedRender(
  url: string | null,
  embed: string | null,
  courseId: string,
  lessonId: string,
): VideoRender {
  const render = buildVideoRender(url, embed);
  if (!render || render.kind !== "direct") return render;
  const token = signVideoToken(courseId, lessonId);
  return {
    kind: "direct",
    src: `/api/video/${courseId}/${lessonId}?t=${token}`,
  };
}