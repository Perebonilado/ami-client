"use client";

import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { formatDuration } from "@/lib/format";
import { usePartLoop } from "./use-part-loop";

export type AgentHit = { title: string; by: string; clip: string; still: string; lengthSec: number; start: number; end: number };

/**
 * An example conversation: someone asks their agent for a clip, the agent searches Àmì over MCP
 * and comes back with the exact moments. Lines appear one after another as it scrolls into view.
 */
export function AgentChat({ ask, query, hits, reply }: { ask: string; query: string; hits: AgentHit[]; reply: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);

  // Lines start visible (no JS, reduced motion, or already on screen). If the chat is still below the
  // fold, hide them (data-stage="wait") and let them appear one by one once it scrolls in ("in").
  useEffect(() => {
    const el = box.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < innerHeight) return;
    el.dataset.stage = "wait";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.stage = "in";
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className="chat" role="img" aria-label={`An AI agent asked: “${ask}”. It searches Àmì and finds ${hits.length} clips with the exact seconds.`}>
      <div aria-hidden className="chat-lines">
        <p className="ask">{ask}</p>
        <p className="tool">
          <span className="ok">
            <Check />
          </span>
          Searched Àmì for “{query}”
        </p>
        <div className="hits">
          {hits.map((h) => (
            <Moment key={h.title} hit={h} />
          ))}
        </div>
        <p className="reply">{reply}</p>
      </div>
    </div>
  );
}

/** A found clip, looping just the moment the agent picked, with where it sits in the video. */
function Moment({ hit }: { hit: AgentHit }) {
  const { box, video, head } = usePartLoop<HTMLDivElement>({ start: hit.start, end: hit.end, length: hit.lengthSec });
  const L = (hit.start / hit.lengthSec) * 100;
  const W = ((hit.end - hit.start) / hit.lengthSec) * 100;

  return (
    <div ref={box} className="hit">
      <div className="hit-pic">
        <video ref={video} muted playsInline preload="none" poster={hit.still} data-src={hit.clip} />
        <span className="at">
          {formatDuration(hit.start)} – {formatDuration(hit.end)}
        </span>
      </div>
      <div className="hit-bar">
        <span className="seg" style={{ left: `${L}%`, width: `${W}%` }} />
        <span ref={head} className="ph" style={{ left: `${L}%` }} />
      </div>
      <b>{hit.title}</b>
      <span className="by">{hit.by}</span>
    </div>
  );
}
