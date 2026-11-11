"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Muted background video for the hero, with a pause control. Shows the poster when people prefer less motion. */
export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => {});
  }, []);

  return (
    <>
      <video ref={ref} muted loop playsInline preload="auto" poster={poster} src={src} onPlay={() => setPaused(false)} onPause={() => setPaused(true)} aria-hidden />
      <button
        type="button"
        className="pause"
        aria-label={paused ? "Play background video" : "Pause background video"}
        onClick={() => (ref.current?.paused ? ref.current.play() : ref.current?.pause())}
      >
        {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
      </button>
    </>
  );
}
