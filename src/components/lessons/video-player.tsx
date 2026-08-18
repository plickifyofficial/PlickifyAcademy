import type { VideoRender } from "@/lib/video";

export function VideoPlayer({
  render,
  poster,
  title,
}: {
  render: VideoRender;
  poster?: string | null;
  title?: string | null;
}) {
  if (!render) return null;

  if (render.kind === "embed") {
    return (
      <div className="relative aspect-video w-full">
        <div
          className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
          dangerouslySetInnerHTML={{ __html: render.html }}
        />
      </div>
    );
  }

  if (render.kind === "iframe") {
    return (
      <iframe
        src={render.src}
        title={title ?? "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="aspect-video w-full"
      />
    );
  }

  return (
    <video
      src={render.src}
      controls
      controlsList="nodownload"
      disablePictureInPicture
      poster={poster ?? undefined}
      onContextMenu={(e) => e.preventDefault()}
      className="aspect-video w-full"
    />
  );
}