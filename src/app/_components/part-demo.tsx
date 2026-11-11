"use client";

import { useEffect, useRef, useState } from "react";
import { drawFilmstrip } from "@/lib/filmstrip";
import { formatDuration } from "@/lib/format";
import { usePartLoop } from "./use-part-loop";

const FRAMES = 8;

/**
 * One clip with the same filmstrip window as the licence calculator.
 * With a part, the clip loops just those seconds and the window shows where they sit.
 * Plays while it's on screen; stays still for reduced motion.
 */
export function PartDemo({
  label,
  src,
  stripSrc,
  poster,
  durationSec,
  start = 0,
  end = durationSec,
}: {
  label: string;
  src: string;
  stripSrc: string;
  poster: string;
  durationSec: number;
  start?: number;
  end?: number;
}) {
  const { box, video, head, near } = usePartLoop<HTMLElement>({ start, end, length: durationSec });
  const frames = useRef<(HTMLCanvasElement | null)[]>([]);
  const [stripReady, setStripReady] = useState(false);

  // Grab the filmstrip frames once the demo comes near the screen
  useEffect(() => {
    if (!near) return;
    return drawFilmstrip(stripSrc, frames.current, () => setStripReady(true));
  }, [near, stripSrc]);

  const L = (start / durationSec) * 100;
  const R = (end / durationSec) * 100;

  return (
    <figure ref={box} className="demo">
      <div className="demo-video">
        <video ref={video} muted playsInline preload="none" poster={poster} data-src={src} aria-hidden />
      </div>
      <div className="demo-strip" style={{ backgroundImage: `url("${poster}")` }} aria-hidden>
        <div className={`frames${stripReady ? " is-ready" : ""}`}>
          {Array.from({ length: FRAMES }, (_, i) => (
            <canvas
              key={i}
              width={160}
              height={90}
              ref={(c) => {
                frames.current[i] = c;
              }}
            />
          ))}
        </div>
        <span className="dim l" style={{ width: `${L}%` }} />
        <span className="dim r" style={{ width: `${100 - R}%` }} />
        <span className="win" style={{ left: `${L}%`, width: `${R - L}%` }} />
        <span ref={head} className="ph" style={{ left: `${L}%` }} />
      </div>
      <figcaption>
        <b>{label}</b>
        <span>
          {formatDuration(start)} – {formatDuration(end)}
        </span>
      </figcaption>
    </figure>
  );
}
