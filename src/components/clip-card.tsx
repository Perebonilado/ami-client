"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatDuration } from "@/lib/format";
import type { Poster } from "@/lib/types";
import { VerifiedTick } from "./icons";

/**
 * Plays a muted, looping preview inside `ref` on hover or keyboard focus.
 * On touch screens it plays while the element is mostly on screen. Respects reduced motion.
 */
export function usePreviewOnHover<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const video = el?.querySelector("video");
    if (!el || !video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const play = () => {
      if (!video.src && video.dataset.src) video.src = video.dataset.src;
      video.play().catch(() => {});
    };
    const stop = () => video.pause();
    const onPlaying = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    let io: IntersectionObserver | null = null;
    if (finePointer) {
      el.addEventListener("mouseenter", play);
      el.addEventListener("mouseleave", stop);
      el.addEventListener("focus", play);
      el.addEventListener("blur", stop);
    } else {
      io = new IntersectionObserver(([e]) => (e.intersectionRatio >= 0.75 ? play() : stop()), { threshold: [0, 0.75] });
      io.observe(el);
    }
    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      el.removeEventListener("mouseenter", play);
      el.removeEventListener("mouseleave", stop);
      el.removeEventListener("focus", play);
      el.removeEventListener("blur", stop);
      io?.disconnect();
    };
  }, []);

  return { ref, playing };
}

/** Still image, or the generated poster colours when a video has no thumbnail yet. */
export function Still({ thumbnailUrl, poster }: { thumbnailUrl: string | null; poster: Poster }) {
  return thumbnailUrl ? (
    // Placeholder media is loaded straight from Pexels/Unsplash, so a plain img keeps it off the image optimiser.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={thumbnailUrl} alt="" loading="lazy" />
  ) : (
    <span className="thumb-poster" style={{ background: `linear-gradient(150deg, ${poster.from}, ${poster.to})` }} />
  );
}

export function ClipCard({
  href,
  title,
  subtitle,
  verified = false,
  durationSec,
  thumbnailUrl,
  poster,
  previewUrl,
  badge,
  muted = false,
}: {
  href: string;
  title: string;
  subtitle: ReactNode;
  verified?: boolean;
  durationSec: number;
  thumbnailUrl: string | null;
  poster: Poster;
  previewUrl?: string | null;
  badge?: ReactNode;
  muted?: boolean;
}) {
  const { ref, playing } = usePreviewOnHover<HTMLAnchorElement>();
  return (
    <Link ref={ref} href={href} className={`card${playing ? " is-playing" : ""}${muted ? " is-muted" : ""}`}>
      <div className="thumb">
        <Still thumbnailUrl={thumbnailUrl} poster={poster} />
        {previewUrl && <video muted loop playsInline preload="none" data-src={previewUrl} aria-hidden />}
        {badge}
        <span className="dur">{formatDuration(durationSec)}</span>
      </div>
      <div className="info">
        <h3>{title}</h3>
        <p>
          <span>{subtitle}</span>
          {verified && <VerifiedTick />}
        </p>
      </div>
    </Link>
  );
}
