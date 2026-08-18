export type VideoRender =
  | { kind: "embed"; html: string }
  | { kind: "iframe"; src: string }
  | { kind: "direct"; src: string }
  | null;

export type VideoProvider =
  | "none"
  | "youtube"
  | "drive"
  | "vimeo"
  | "direct"
  | "embed";

export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m?.[1] ?? null;
}

export function driveId(url: string): string | null {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  return m?.[1] ?? null;
}

export function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m?.[1] ?? null;
}

export function detectProvider(url: string): VideoProvider {
  if (!url) return "none";
  if (youtubeId(url)) return "youtube";
  if (driveId(url)) return "drive";
  if (vimeoId(url)) return "vimeo";
  if (/\.(mp4|webm|ogg|m4v|mov)(\?.*)?$/i.test(url)) return "direct";
  return "direct";
}

export function providerHint(type: VideoProvider): string {
  switch (type) {
    case "youtube":
      return "YouTube video link (e.g. https://youtu.be/xxxx or https://www.youtube.com/watch?v=xxxx)";
    case "drive":
      return "Google Drive share link (e.g. https://drive.google.com/file/d/XXXX/view) — the link must be shared as 'Anyone with the link'";
    case "vimeo":
      return "Vimeo video link";
    case "direct":
      return "Direct video file URL (.mp4/.webm/.ogg)";
    case "embed":
      return "Paste the full iframe embed code (Share → Embed from YouTube / Google Drive / Vimeo)";
    default:
      return "No video";
  }
}

export function buildVideoRender(
  url: string | null,
  embed: string | null,
): VideoRender {
  const embedHtml = (embed ?? "").trim();
  if (embedHtml) return { kind: "embed", html: embedHtml };

  const videoUrl = (url ?? "").trim();
  if (!videoUrl) return null;

  const yt = youtubeId(videoUrl);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt}` };

  const dv = driveId(videoUrl);
  if (dv)
    return { kind: "iframe", src: `https://drive.google.com/file/d/${dv}/preview` };

  const vm = vimeoId(videoUrl);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm}` };

  return { kind: "direct", src: videoUrl };
}