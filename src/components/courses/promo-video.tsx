"use client";

import Image from "next/image";
import { useState } from "react";
import { VideoPlayer } from "@/components/lessons/video-player";

export function PromoVideo({
  coverImage,
  title,
  url,
  embed,
}: {
  coverImage: string | null;
  title: string;
  url: string | null;
  embed: string | null;
}) {
  const [playing, setPlaying] = useState(false);
  const hasVideo = !!(url?.trim() || embed?.trim());

  if (playing && hasVideo) {
    return (
      <div className="aspect-[16/10] bg-black">
        <VideoPlayer url={url} embed={embed} poster={coverImage} title={title} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => hasVideo && setPlaying(true)}
      className="relative block h-full w-full cursor-pointer"
      aria-label={hasVideo ? "প্রোমো ভিডিও দেখুন" : undefined}
    >
      <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-brand-700 to-purple-800">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            priority
            sizes="360px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-white/30">
            {title.charAt(0)}
          </div>
        )}
        {hasVideo && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/20">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl text-brand-700 shadow-xl">
              <i className="fa-solid fa-play ml-1" />
            </span>
          </span>
        )}
      </div>
    </button>
  );
}