"use client";

import { ArrowRight, Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState, type RefObject } from "react";
import { ClipCard } from "@/components/clip-card";
import { VerifiedTick } from "@/components/icons";
import { Loading } from "@/components/loading";
import { Wordmark } from "@/components/logo";
import { Segmented } from "@/components/segmented";
import { drawFilmstrip } from "@/lib/filmstrip";
import { formatDuration, formatNaira, initials } from "@/lib/format";
import { DURATIONS, MIN_PART_SEC, durationPhrase, licencePriceKobo } from "@/lib/pricing";
import type { Duration, LicencePart, Video } from "@/lib/types";
import { errorMessage, useCheckoutMutation, useGetVideoQuery, useListVideosQuery } from "@/store/api";
import { useAuth } from "@/store/auth";

type What = "whole" | "part";
type Range = { start: number; end: number };

const WHAT_OPTIONS: { value: What; label: string }[] = [
  { value: "whole", label: "Whole video" },
  { value: "part", label: "Part of it" },
];
const DURATION_OPTIONS = DURATIONS.map((d) => ({ value: d.value, label: d.label }));

const FRAMES = 8;
const seconds = (n: number) => `${n} second${n === 1 ? "" : "s"}`;

export function VideoView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading } = useGetVideoQuery(id);

  if (isLoading) return <Loading label="Loading video" />;
  if (error || !data)
    return (
      <div className="wrap">
        <div className="empty">
          <h2>This video isn’t available</h2>
          <p>The creator may have hidden it, or the link is wrong.</p>
          <Link href="/browse" className="btn btn-ghost">
            Browse videos
          </Link>
        </div>
      </div>
    );

  return <VideoPage key={data.video.id} video={data.video} />;
}

function VideoPage({ video }: { video: Video }) {
  const total = Math.max(MIN_PART_SEC, Math.round(video.durationSec));
  const videoRef = useRef<HTMLVideoElement>(null);
  const [what, setWhat] = useState<What>("whole");
  const [duration, setDuration] = useState<Duration>("1m");
  const [range, setRange] = useState<Range>(() => {
    const start = Math.min(Math.round(total * 0.25), total - MIN_PART_SEC);
    return { start, end: Math.min(total, start + Math.max(MIN_PART_SEC, Math.round(total * 0.4))) };
  });

  const part: LicencePart | null = what === "part" ? { startSec: range.start, endSec: range.end } : null;
  const price = formatNaira(licencePriceKobo(video.basePriceKobo, video.durationSec, part, duration));
  const summary = `${part ? seconds(range.end - range.start) : "Whole video"} · ${durationPhrase(duration)}`;

  const seek = (t: number) => {
    const v = videoRef.current;
    if (v && v.readyState > 0) v.currentTime = t;
  };

  return (
    <>
      <div className="wrap">
        <section className="top">
          <h1>{video.title}</h1>
          <p className="meta">
            {video.creator.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.creator.avatarUrl} alt="" />
            ) : (
              <span className="ini" aria-hidden>
                {initials(video.creator.name)}
              </span>
            )}
            <Link className="who" href={`/browse?q=${encodeURIComponent(video.creator.name)}`}>
              {video.creator.name}
              {video.creator.verified && <VerifiedTick />}
            </Link>
            <span aria-hidden>·</span>
            <span>{video.category}</span>
            <span aria-hidden>·</span>
            <span>{formatDuration(video.durationSec)}</span>
          </p>
        </section>

        <div className="layout">
          <div>
            <Player video={video} videoRef={videoRef} loop={part ? range : null} />
          </div>

          <Calculator
            video={video}
            total={total}
            what={what}
            onWhat={(w) => {
              setWhat(w);
              if (w === "part") seek(range.start);
            }}
            duration={duration}
            onDuration={setDuration}
            range={range}
            onRange={(r, edge) => {
              setRange(r);
              seek(edge === "end" ? Math.max(r.start, r.end - 1) : r.start);
            }}
            videoRef={videoRef}
            part={part}
            price={price}
            summary={summary}
          />
        </div>

        <MoreLikeThis video={video} />
      </div>

      <BuyBar price={price} summary={summary} />
    </>
  );
}

/* ---------- Player ---------- */

function Player({ video, videoRef, loop }: { video: Video; videoRef: RefObject<HTMLVideoElement | null>; loop: Range | null }) {
  const box = useRef<HTMLDivElement>(null);
  const loopRef = useRef(loop);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(video.durationSec);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      const r = loopRef.current;
      if (r && (v.currentTime >= r.end || v.currentTime < r.start - 0.25)) v.currentTime = r.start;
      setTime(v.currentTime);
    };
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    const onMeta = () => v.duration && setLength(v.duration);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("loadedmetadata", onMeta);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => {});
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("loadedmetadata", onMeta);
    };
  }, [videoRef]);

  const v = () => videoRef.current;
  const toggle = () => {
    const el = v();
    if (el) void (el.paused ? el.play().catch(() => {}) : el.pause());
  };
  const toggleMute = () => {
    const el = v();
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };
  const fullscreen = () => {
    if (document.fullscreenElement) return void document.exitFullscreen();
    if (box.current?.requestFullscreen) return void box.current.requestFullscreen().catch(() => {});
    // iPhone Safari only lets the video element itself go full screen
    (v() as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null)?.webkitEnterFullscreen?.();
  };

  return (
    <div ref={box} className={`player${paused ? " is-paused" : ""}`}>
      <video
        ref={videoRef}
        src={video.previewUrl}
        poster={video.thumbnailUrl ?? undefined}
        muted
        loop
        playsInline
        preload="auto"
        onClick={toggle}
        aria-label={`Preview of ${video.title}`}
      />
      <span className="bug" aria-hidden>
        <Wordmark />
        Preview
      </span>
      <div className="controls">
        <button className="ctl" type="button" onClick={toggle} aria-label={paused ? "Play" : "Pause"}>
          {paused ? <Play fill="currentColor" strokeWidth={0} /> : <Pause fill="currentColor" strokeWidth={0} />}
        </button>
        <span className="time">
          {formatDuration(Math.floor(time))} / {formatDuration(length)}
        </span>
        <div
          className="track"
          aria-hidden
          onClick={(e) => {
            const el = v();
            const r = e.currentTarget.getBoundingClientRect();
            if (el?.duration) el.currentTime = ((e.clientX - r.left) / r.width) * el.duration;
          }}
        >
          <span style={{ width: `${length ? Math.min(100, (time / length) * 100) : 0}%` }} />
        </div>
        <button className="ctl" type="button" onClick={toggleMute} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
          {muted ? <VolumeX /> : <Volume2 />}
        </button>
        <button className="ctl" type="button" onClick={fullscreen} aria-label="Full screen">
          <Maximize />
        </button>
      </div>
    </div>
  );
}

/* ---------- Licence calculator ---------- */

function Calculator({
  video,
  total,
  what,
  onWhat,
  duration,
  onDuration,
  range,
  onRange,
  videoRef,
  part,
  price,
  summary,
}: {
  video: Video;
  total: number;
  what: What;
  onWhat: (w: What) => void;
  duration: Duration;
  onDuration: (d: Duration) => void;
  range: Range;
  onRange: (r: Range, edge: "start" | "end") => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  part: LicencePart | null;
  price: string;
  summary: string;
}) {
  const router = useRouter();
  const { user, ready, loginWithTestAccount } = useAuth();
  const [checkout] = useCheckoutMutation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const own = user?.id === video.creator.id;

  const pay = async () => {
    setBusy(true);
    setError(null);
    // Logged out: sign in with the test account and carry straight on to payment
    let me = user;
    if (!me) {
      try {
        me = await loginWithTestAccount();
      } catch {
        return router.push(`/login?next=${encodeURIComponent(`/videos/${video.id}`)}`);
      }
      if (me.id === video.creator.id) return setBusy(false); // the button now reads "This is your video"
    }
    try {
      const { paymentUrl } = await checkout({ videoId: video.id, part, duration }).unwrap();
      // The bank's hosted checkout is another site, so leave with a full page load; the mock points back here
      const target = new URL(paymentUrl, window.location.href);
      if (target.origin === window.location.origin) router.push(`${target.pathname}${target.search}`);
      else window.location.assign(target.href);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <aside className="lic" id="lic" aria-label="License this video">
      <p className="price" aria-live="polite">
        {price}
      </p>
      <p className="summary">{summary}</p>

      <div className="q">
        <span className="lbl">What do you need?</span>
        <Segmented label="What do you need?" value={what} options={WHAT_OPTIONS} onChange={onWhat} />
        <div className={`range${what === "whole" ? " is-off" : ""}`} aria-hidden={what === "whole"} inert={what === "whole"}>
          <div>
            <TrimWindow video={video} total={total} range={range} onRange={onRange} videoRef={videoRef} active={what === "part"} />
          </div>
        </div>
      </div>

      <div className="q">
        <span className="lbl">How long?</span>
        <Segmented label="How long?" value={duration} options={DURATION_OPTIONS} onChange={onDuration} />
      </div>

      {own ? (
        <>
          <button className="btn btn-ink" type="button" disabled>
            This is your video
          </button>
          <p className="note">
            You can’t license your own video. <Link href="/browse">Find another clip</Link>
          </p>
        </>
      ) : (
        <button className="btn btn-ink" type="button" onClick={pay} disabled={busy || !ready}>
          {busy ? "One moment…" : "Continue to payment"}
        </button>
      )}
      {error && (
        <p className="form-err" role="alert">
          {error}
        </p>
      )}
    </aside>
  );
}

/** A filmstrip of the clip with a window over it. Drag either edge, or the whole window. Snaps to whole seconds. */
function TrimWindow({
  video,
  total,
  range,
  onRange,
  videoRef,
  active,
}: {
  video: Video;
  total: number;
  range: Range;
  onRange: (r: Range, edge: "start" | "end") => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  active: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  const frames = useRef<(HTMLCanvasElement | null)[]>([]);
  const [stripReady, setStripReady] = useState(false);
  // Only grab frames once someone actually asks for part of the video
  const [wanted, setWanted] = useState(active);
  if (active && !wanted) setWanted(true);

  useEffect(() => {
    if (!wanted) return;
    return drawFilmstrip(video.previewUrl, frames.current, () => setStripReady(true));
  }, [wanted, video.previewUrl]);

  // Playhead follows the preview
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (head.current && v.duration) head.current.style.left = `${(v.currentTime / v.duration) * 100}%`;
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [videoRef]);

  const drag = (kind: "start" | "end" | "move", e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const width = track.current?.getBoundingClientRect().width ?? 1;
    const x0 = e.clientX;
    const { start: s0, end: e0 } = range;
    const move = (ev: PointerEvent) => {
      const dt = Math.round(((ev.clientX - x0) / width) * total);
      if (kind === "start") onRange({ start: clamp(s0 + dt, 0, e0 - MIN_PART_SEC), end: e0 }, "start");
      else if (kind === "end") onRange({ start: s0, end: clamp(e0 + dt, s0 + MIN_PART_SEC, total) }, "end");
      else {
        const start = clamp(s0 + dt, 0, total - (e0 - s0));
        onRange({ start, end: start + (e0 - s0) }, "start");
      }
    };
    const stop = () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", stop);
      removeEventListener("pointercancel", stop);
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", stop);
    addEventListener("pointercancel", stop);
  };

  const nudge = (edge: "start" | "end", e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    if (edge === "start") onRange({ start: clamp(range.start + step, 0, range.end - MIN_PART_SEC), end: range.end }, "start");
    else onRange({ start: range.start, end: clamp(range.end + step, range.start + MIN_PART_SEC, total) }, "end");
  };

  const L = (range.start / total) * 100;
  const R = (range.end / total) * 100;

  return (
    <>
      <div ref={track} className="rtrack" style={video.thumbnailUrl ? { backgroundImage: `url("${video.thumbnailUrl}")` } : undefined}>
        <div className={`strip${stripReady ? " is-ready" : ""}`} aria-hidden>
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
        <span className="rdim l" style={{ width: `${L}%` }} />
        <span className="rdim r" style={{ width: `${100 - R}%` }} />
        <div className="rsel" style={{ left: `${L}%`, width: `${R - L}%` }} onPointerDown={(e) => drag("move", e)}>
          <span
            className="h l"
            role="slider"
            tabIndex={0}
            aria-label="Start of the part"
            aria-valuemin={0}
            aria-valuemax={range.end - MIN_PART_SEC}
            aria-valuenow={range.start}
            aria-valuetext={formatDuration(range.start)}
            onPointerDown={(e) => drag("start", e)}
            onKeyDown={(e) => nudge("start", e)}
          />
          <span
            className="h r"
            role="slider"
            tabIndex={0}
            aria-label="End of the part"
            aria-valuemin={range.start + MIN_PART_SEC}
            aria-valuemax={total}
            aria-valuenow={range.end}
            aria-valuetext={formatDuration(range.end)}
            onPointerDown={(e) => drag("end", e)}
            onKeyDown={(e) => nudge("end", e)}
          />
        </div>
        <span ref={head} className="ph" />
      </div>
      <p className="rmeta">
        <span>
          {formatDuration(range.start)} – {formatDuration(range.end)}
        </span>
        <b>{seconds(range.end - range.start)}</b>
      </p>
    </>
  );
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/* ---------- More from the same category ---------- */

function MoreLikeThis({ video }: { video: Video }) {
  const { data } = useListVideosQuery({ category: video.category });
  const more = (data?.videos ?? []).filter((v) => v.id !== video.id).slice(0, 4);
  if (more.length === 0) return null;

  return (
    <section className="more-row" aria-labelledby="more-h">
      <div className="head">
        <h2 id="more-h">More {video.category.toLowerCase()}</h2>
        <Link className="link" href={`/browse?cat=${encodeURIComponent(video.category)}`}>
          See all <ArrowRight aria-hidden />
        </Link>
      </div>
      <div className="cards">
        {more.map((v) => (
          <ClipCard
            key={v.id}
            href={`/videos/${v.id}`}
            title={v.title}
            subtitle={v.creator.name}
            verified={v.creator.verified}
            durationSec={v.durationSec}
            thumbnailUrl={v.thumbnailUrl}
            poster={v.poster}
            previewUrl={v.previewUrl}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------- Phone: price pinned to the bottom while the calculator is off screen ---------- */

function BuyBar({ price, summary }: { price: string; summary: string }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const lic = document.getElementById("lic");
    if (!lic) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), { threshold: 0.2 });
    io.observe(lic);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`buybar${hidden ? " is-hidden" : ""}`} aria-hidden={hidden}>
      <div>
        <b>{price}</b>
        <span>{summary}</span>
      </div>
      <a className="btn btn-ink" href="#lic" tabIndex={hidden ? -1 : undefined}>
        License
      </a>
    </div>
  );
}
