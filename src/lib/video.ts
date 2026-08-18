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
      return "YouTube ভিডিও লিংক (যেমন: https://youtu.be/xxxx বা https://www.youtube.com/watch?v=xxxx)";
    case "drive":
      return "Google Drive শেয়ার লিংক (যেমন: https://drive.google.com/file/d/XXXX/view) — লিংকটি অবশ্যই 'Anyone with the link' হিসাবে শেয়ার করা থাকতে হবে";
    case "vimeo":
      return "Vimeo ভিডিও লিংক";
    case "direct":
      return "সরাসরি ভিডিও ফাইল URL (.mp4/.webm/.ogg)";
    case "embed":
      return "পুরো iframe embed কোড পেস্ট করুন (YouTube / Google Drive / Vimeo থেকে Share → Embed)";
    default:
      return "কোনো ভিডিও নেই";
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