"use client";

import { CheckCircle2, Film, Fingerprint, RotateCcw, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Checkbox, ProgressBar } from "@/components/ui/controls";
import { FormError, TextAreaField, TextField } from "@/components/ui/field";
import { Container, PageHeader, Panel, Spinner } from "@/components/ui/page";
import { Select } from "@/components/ui/select";
import { VideoThumb } from "@/components/video-thumb";
import { ApiError, api } from "@/lib/api";
import { formatBytes, formatDuration, shortHash } from "@/lib/format";
import { CATEGORIES, suggestedPrices } from "@/lib/pricing";
import type { Video, VideoPrice } from "@/lib/types";
import { PriceEditor } from "../../library/_components/price-editor";
import { useRequireUser } from "../../library/_components/require-user";

const MAX_BYTES = 200 * 1024 * 1024;

type FileInfo = { file: File; sha256: string; durationSec: number; thumbnail: string | null };

const STAGES = [
  { until: 40, label: "Uploading file" },
  { until: 75, label: "Making watermarked preview" },
  { until: 100, label: "Making thumbnail" },
];

async function sha256Hex(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Reads the duration and grabs a frame near 1 second as a JPEG thumbnail. */
function readVideo(file: File): Promise<{ durationSec: number; thumbnail: string | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    let settled = false;
    const finish = (result: { durationSec: number; thumbnail: string | null }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(result);
    };
    const duration = () => (Number.isFinite(video.duration) ? video.duration : 0);
    const timer = setTimeout(() => finish({ durationSec: duration(), thumbnail: null }), 10_000);

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, duration() / 2 || 0);
    };
    video.onseeked = () => {
      try {
        const w = Math.min(640, video.videoWidth || 640);
        const h = video.videoWidth ? Math.round((w * video.videoHeight) / video.videoWidth) : 800;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(video, 0, 0, w, h);
        finish({ durationSec: duration(), thumbnail: canvas.toDataURL("image/jpeg", 0.75) });
      } catch {
        finish({ durationSec: duration(), thumbnail: null });
      }
    };
    video.onerror = () => finish({ durationSec: 0, thumbnail: null });
    video.src = url;
  });
}

function parseTags(text: string) {
  const tags = text
    .split(",")
    .map((t) => t.trim().replace(/^#/, "").toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(tags)).slice(0, 10);
}

export function UploadForm() {
  const user = useRequireUser("/upload");
  if (!user) return <Spinner label="Checking your account" />;
  return <UploadFlow />;
}

function UploadFlow() {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [reading, setReading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tagsText, setTagsText] = useState("");
  const [prices, setPrices] = useState<VideoPrice[]>(suggestedPrices);
  const [ownsVideo, setOwnsVideo] = useState(false);
  const [hasRights, setHasRights] = useState(false);

  const [phase, setPhase] = useState<"form" | "publishing" | "done">("form");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Video | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => {
    if (tickerRef.current) clearInterval(tickerRef.current);
  }, []);

  const tags = parseTags(tagsText);
  const hasPrice = prices.some((p) => p.enabled && p.basePriceKobo > 0);
  const missing = [
    !fileInfo && "add a video file",
    !title.trim() && "add a title",
    !category && "pick a category",
    !hasPrice && "offer at least one licence type",
    !(ownsVideo && hasRights) && "tick both declarations",
  ].filter(Boolean) as string[];

  async function pickFile(file: File | undefined) {
    if (!file) return;
    setFileError(null);
    const isMp4 = file.type === "video/mp4" || /\.mp4$/i.test(file.name);
    if (!isMp4) {
      setFileError("Àmì accepts MP4 videos for now. Export your video as MP4 and try again.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError(`This file is ${formatBytes(file.size)}. Videos can be up to 200 MB for the demo.`);
      return;
    }
    setReading(true);
    try {
      const [sha256, meta] = await Promise.all([sha256Hex(file), readVideo(file)]);
      setFileInfo({ file, sha256, ...meta });
      if (!title.trim()) setTitle(file.name.replace(/\.mp4$/i, "").replace(/[-_]+/g, " ").trim());
    } catch {
      setFileError("We couldn't read this file. Try another MP4.");
    } finally {
      setReading(false);
    }
  }

  async function publish() {
    if (missing.length || !fileInfo || !category) return;
    setError(null);
    setPhase("publishing");
    setProgress(0);

    // Simulated progress. TODO(Eradiri): replace with real upload progress
    // (XHR upload.onprogress or the storage SDK), then poll the processing job
    // for the "watermarked preview" and "thumbnail" stages.
    const ticker = new Promise<void>((resolve) => {
      let p = 0;
      tickerRef.current = setInterval(() => {
        p = Math.min(100, p + 4);
        setProgress(p);
        if (p >= 100) {
          if (tickerRef.current) clearInterval(tickerRef.current);
          resolve();
        }
      }, 100);
    });

    try {
      const [{ video }] = await Promise.all([
        api.createVideo({
          title: title.trim(),
          description: description.trim(),
          category,
          tags,
          prices,
          declarations: { ownsVideo, hasRights },
          fileName: fileInfo.file.name,
          fileSizeBytes: fileInfo.file.size,
          fileSha256: fileInfo.sha256,
          durationSec: fileInfo.durationSec,
          thumbnailDataUrl: fileInfo.thumbnail,
        }),
        ticker,
      ]);
      setCreated(video);
      setPhase("done");
    } catch (err) {
      if (tickerRef.current) clearInterval(tickerRef.current);
      setPhase("form");
      setError(err instanceof ApiError ? err.message : "Publishing failed. Check your connection and try again.");
    }
  }

  function reset() {
    setFileInfo(null);
    setTitle("");
    setDescription("");
    setCategory(null);
    setTagsText("");
    setPrices(suggestedPrices());
    setOwnsVideo(false);
    setHasRights(false);
    setCreated(null);
    setError(null);
    setProgress(0);
    setPhase("form");
  }

  if (phase === "done" && created) {
    return (
      <Container className="flex max-w-3xl flex-col gap-6 py-10 sm:py-14">
        <Panel className="flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:items-center sm:p-8 sm:text-left">
          <VideoThumb thumbnailUrl={created.thumbnailUrl} poster={created.poster} title={created.title} className="aspect-[4/5] w-40 shrink-0 rounded-2xl" />
          <div className="flex min-w-0 flex-col items-center gap-3 sm:items-start">
            <Badge tone="ok">Live on Àmì</Badge>
            <h1 className="text-2xl leading-tight font-extrabold sm:text-3xl">{created.title}</h1>
            <p className="text-[15px] text-muted">
              Your video is on the browse page with a watermarked preview. Pages and brands can now license it, and every sale shows up in your library.
            </p>
            <p className="flex items-center gap-1.5 text-[13px] text-muted">
              <Fingerprint size={14} /> Registered fingerprint <span className="code text-ink">{shortHash(created.fileSha256)}</span>
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-2 sm:justify-start">
              <LinkButton href={`/videos/${created.id}`}>View on browse</LinkButton>
              <LinkButton href="/library" variant="secondary">
                Go to my library
              </LinkButton>
              <Button variant="ghost" onClick={reset}>
                <RotateCcw size={15} /> Upload another
              </Button>
            </div>
          </div>
        </Panel>
      </Container>
    );
  }

  const publishing = phase === "publishing";
  const stage = STAGES.find((s) => progress < s.until) ?? STAGES[STAGES.length - 1];

  return (
    <Container className="flex max-w-3xl flex-col gap-8 py-10 sm:py-14">
      <PageHeader
        eyebrow="Upload"
        title="List a video for licensing"
        description="Register your video, set what each licence costs, and publish. Àmì shows a watermarked preview; buyers only get the clean file after they pay."
      />

      <fieldset disabled={publishing} className="flex min-w-0 flex-col gap-6">
        {/* File */}
        <Panel className="flex flex-col gap-4 p-5 sm:p-6">
          <h2 className="text-lg font-extrabold">Video file</h2>
          {fileInfo ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-line bg-sunken/60 p-4 sm:flex-row sm:items-center">
              <VideoThumb
                thumbnailUrl={fileInfo.thumbnail}
                poster={{ from: "#1A141F", to: "#5B3A6E" }}
                title=""
                showPlay={false}
                className="aspect-[4/5] w-24 shrink-0 rounded-xl"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="truncate font-bold text-ink">{fileInfo.file.name}</p>
                <p className="text-[13px] text-muted tabular">
                  {formatBytes(fileInfo.file.size)}
                  {fileInfo.durationSec > 0 && ` · ${formatDuration(fileInfo.durationSec)}`}
                </p>
                <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
                  <Fingerprint size={14} className="text-ember" />
                  Fingerprint <span className="code text-ink">{shortHash(fileInfo.sha256)}</span>
                </p>
                <p className="text-[12px] text-muted">This fingerprint proves which exact file you registered and when.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFileInfo(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                <X size={15} /> Remove
              </Button>
            </div>
          ) : (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                void pickFile(e.dataTransfer.files[0]);
              }}
              className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink ${
                dragging ? "border-ember bg-ember-wash" : "border-line-strong bg-sunken/50 hover:border-ink"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,.mp4"
                className="sr-only"
                onChange={(e) => void pickFile(e.target.files?.[0])}
              />
              {reading ? (
                <>
                  <span className="size-8 animate-spin rounded-full border-2 border-line-strong border-t-ink" aria-hidden />
                  <span className="font-semibold text-ink">Reading your file and making its fingerprint…</span>
                </>
              ) : (
                <>
                  <span className="flex size-12 items-center justify-center rounded-full bg-white text-ink shadow-sm ring-1 ring-line">
                    {dragging ? <Film size={22} /> : <UploadCloud size={22} />}
                  </span>
                  <span className="text-[15px] font-bold text-ink">Drop your MP4 here, or click to choose</span>
                  <span className="text-[13px] text-muted">MP4, up to 200 MB</span>
                </>
              )}
            </label>
          )}
          <FormError>{fileError}</FormError>
        </Panel>

        {/* Details */}
        <Panel className="flex flex-col gap-5 p-5 sm:p-6">
          <h2 className="text-lg font-extrabold">Details</h2>
          <TextField id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="When the light comes back at 3am" maxLength={120} />
          <TextAreaField
            id="description"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happens in the video, and anything a buyer should know."
            rows={4}
            maxLength={1000}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Category" options={CATEGORIES.map((c) => ({ value: c, label: c }))} value={category} onChange={setCategory} placeholder="Pick a category" />
            <TextField id="tags" label="Tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="lagos, family, nepa" description="Separate tags with commas." />
          </div>
          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
              {tags.map((t) => (
                <li key={t} className="rounded-full bg-sunken px-2.5 py-1 text-[13px] font-semibold text-ink ring-1 ring-line">
                  #{t}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Prices */}
        <Panel className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex max-w-lg flex-col gap-1">
              <h2 className="text-lg font-extrabold">Licence prices</h2>
              <p className="text-[14px] text-muted">
                Set one base price per licence type. 90 days costs 2×, a year 5×, lifetime 10×, and all platforms doubles it. Àmì keeps 15% of each sale.
              </p>
            </div>
            <button type="button" onClick={() => setPrices(suggestedPrices())} className="text-sm font-semibold text-ember-ink underline-offset-4 hover:underline">
              Use suggested prices
            </button>
          </div>
          <PriceEditor prices={prices} onChange={setPrices} />
        </Panel>

        {/* Declarations */}
        <Panel className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-extrabold">Declarations</h2>
            <p className="text-[14px] text-muted">Buyers rely on these when they pay for a licence. False declarations lose access to Àmì.</p>
          </div>
          <Checkbox checked={ownsVideo} onChange={setOwnsVideo} description="You made it, or you have the right to license it.">
            I own this video
          </Checkbox>
          <Checkbox checked={hasRights} onChange={setHasRights} description="Including any music in it and everyone who appears in it.">
            I have the rights to any music and people in it
          </Checkbox>
        </Panel>
      </fieldset>

      <FormError>{error}</FormError>

      {publishing ? (
        <Panel className="flex flex-col gap-3 p-5 sm:p-6" aria-live="polite">
          <ProgressBar value={progress} label={stage.label} />
          <ol className="flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
            {STAGES.map((s, i) => {
              const done = progress >= s.until;
              const active = !done && (i === 0 || progress >= STAGES[i - 1].until);
              return (
                <li key={s.label} className={`flex items-center gap-1.5 ${done ? "text-ok" : active ? "font-semibold text-ink" : "text-faint"}`}>
                  <CheckCircle2 size={14} className={done ? "" : "opacity-40"} />
                  {s.label}
                </li>
              );
            })}
          </ol>
        </Panel>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted">{missing.length ? `To publish, ${missing.join(", ")}.` : "Ready to publish."}</p>
          <Button size="lg" onClick={publish} disabled={missing.length > 0}>
            Publish video
          </Button>
        </div>
      )}
    </Container>
  );
}
