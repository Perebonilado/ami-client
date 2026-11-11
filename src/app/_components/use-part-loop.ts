"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Loops seconds `start`–`end` of a muted video while `box` is on screen, and pauses it off screen.
 * The video loads lazily from `data-src`. `head` (optional) is moved along a timeline as it plays.
 * `near` turns true once the box comes close to the screen. Stays still for reduced motion.
 */
export function usePartLoop<T extends HTMLElement>({ start, end, length }: { start: number; end: number; length: number }) {
  const box = useRef<T>(null);
  const video = useRef<HTMLVideoElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const v = video.current;
    const el = box.current;
    if (!v || !el) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const tick = () => {
      if (v.currentTime >= end || v.currentTime < start - 0.25) v.currentTime = start;
      if (head.current) head.current.style.left = `${(v.currentTime / length) * 100}%`;
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => (raf = requestAnimationFrame(tick));
    const onPause = () => cancelAnimationFrame(raf);
    const onMeta = () => (v.currentTime = start);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("loadedmetadata", onMeta);

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
        if (e.intersectionRatio >= 0.4 && !still) {
          if (!v.src && v.dataset.src) v.src = v.dataset.src;
          v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: [0, 0.4], rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("loadedmetadata", onMeta);
    };
  }, [start, end, length]);

  return { box, video, head, near };
}
