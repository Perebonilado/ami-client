"use client";

import Link from "next/link";
import { usePreviewOnHover } from "@/components/clip-card";
import { formatDuration } from "@/lib/format";

/** A category tile that plays its clip on hover (or while on screen on phones). */
export function CategoryTile({ name, still, clip, durationSec, loopEndSec }: { name: string; still: string; clip: string; durationSec: number; loopEndSec?: number }) {
  const { ref, playing } = usePreviewOnHover<HTMLAnchorElement>();
  return (
    <Link ref={ref} href={`/browse?cat=${name}`} className={`cat${playing ? " is-playing" : ""}`} aria-label={`${name} clips`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={still} alt="" loading="lazy" />
      <video
        muted
        loop
        playsInline
        preload="none"
        data-src={clip}
        aria-hidden
        onTimeUpdate={(e) => {
          // Long clips loop a short, on-subject opening
          if (loopEndSec && e.currentTarget.currentTime >= loopEndSec) e.currentTarget.currentTime = 0;
        }}
      />
      <span className="cat-bar">
        <span className="cat-name">{name}</span>
        <span className="cat-time">{formatDuration(durationSec)}</span>
      </span>
    </Link>
  );
}
