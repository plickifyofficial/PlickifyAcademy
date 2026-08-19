import "server-only";
import { createHmac, createHash, timingSafeEqual } from "crypto";

const TOKEN_TTL_SECONDS = 60 * 60;

function downloadSecret(): Buffer {
  const parts = [
    process.env.VIDEO_SIGN_SECRET,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ].filter(Boolean);
  return createHash("sha256")
    .update(parts.join("::") || "plickify-download-sign-v1")
    .digest();
}

export function signDownloadToken(
  productId: string,
  exp = Date.now() + TOKEN_TTL_SECONDS * 1000,
): string {
  const sig = createHmac("sha256", downloadSecret())
    .update(`${productId}.${exp}`)
    .digest("base64url");
  return Buffer.from(`${exp}.${productId}.${sig}`).toString("base64url");
}

export function verifyDownloadToken(
  token: string,
  productId: string,
): boolean {
  try {
    const raw = Buffer.from(token, "base64url").toString();
    const [exp, pid, sig] = raw.split(".");
    if (!exp || !pid || !sig) return false;
    if (pid !== productId) return false;
    if (Number(exp) < Date.now()) return false;
    const expected = createHmac("sha256", downloadSecret())
      .update(`${pid}.${exp}`)
      .digest();
    const provided = Buffer.from(sig, "base64url");
    if (provided.length !== expected.length) return false;
    return timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}