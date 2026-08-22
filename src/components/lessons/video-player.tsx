"use client";

import { useEffect, useRef } from "react";
import { updateLessonProgress } from "@/lib/actions/learning";
import type { VideoRender } from "@/lib/video";

type Props = {
  render: VideoRender;
  poster?: string | null;
  title?: string | null;
  lessonId?: string;
  initialPosition?: number;
  completionRule?: "manual" | "video_percent";
  completionPercent?: number;
  onAutoComplete?: () => void;
};

export function VideoPlayer({
  render,
  poster,
  title,
  lessonId,
  initialPosition = 0,
  onAutoComplete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const positionRef = useRef(initialPosition);
  const deltaRef = useRef(0);
  const savedRef = useRef(0);
  const doneRef = useRef(false);
  const tracking = !!lessonId && render?.kind === "direct";

  function saveProgress(flushDelta: boolean) {
    if (!lessonId) return;
    const position = Math.floor(positionRef.current);
    const delta = flushDelta ? deltaRef.current : 0;
    if (delta > 0) deltaRef.current = 0;
    if (position === savedRef.current && delta === 0) return;
    savedRef.current = position;
    void updateLessonProgress({
      lessonId,
      positionSeconds: position,
      watchedDelta: delta,
    })
      .then((res) => {
        if (res?.autoCompleted && !doneRef.current) {
          doneRef.current = true;
          onAutoComplete?.();
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    if (!render || render.kind !== "direct" || !lessonId) return;
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      if (initialPosition > 0 && video.duration > initialPosition) {
        video.currentTime = initialPosition;
      }
    };

    const onTimeUpdate = () => {
      positionRef.current = video.currentTime;
      deltaRef.current += Math.max(0, video.currentTime - savedRef.current);
      savedRef.current = video.currentTime;
    };

    const onPause = () => saveProgress(true);
    const onEnded = () => saveProgress(true);
    const onBeforeUnload = () => saveProgress(true);

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    window.addEventListener("pagehide", onBeforeUnload);

    const interval = window.setInterval(() => saveProgress(true), 10000);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      window.removeEventListener("pagehide", onBeforeUnload);
      window.clearInterval(interval);
      saveProgress(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  if (!render) return null;

  if (render.kind === "embed") {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <div
          className="absolute inset-0 [&>*]:absolute [&>*]:inset-0 [&>*]:h-full [&>*]:w-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
          dangerouslySetInnerHTML={{ __html: render.html }}
        />
      </div>
    );
  }

  if (render.kind === "iframe") {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          src={render.src}
          title={title ?? "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={render.src}
        controls
        controlsList="nodownload"
        disablePictureInPicture={!tracking}
        playsInline
        poster={poster ?? undefined}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}