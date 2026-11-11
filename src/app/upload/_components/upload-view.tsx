"use client";

import { Upload } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_ICONS } from "@/components/icons";
import { Loading } from "@/components/loading";
import { formatBytes } from "@/lib/format";
import { CATEGORIES, MIN_BASE_KOBO, SUGGESTED_BASE_KOBO } from "@/lib/pricing";
import type { Video } from "@/lib/types";
import { useRequireUser } from "@/lib/use-require-user";
import { errorMessage, useCreateVideoMutation } from "@/store/api";

const MAX_BYTES = 200 * 1024 * 1024;
const STAGES = [
  { until: 40, label: "Uploading the file." },
  { until: 75, label: "Making the watermarked preview." },
  { until: 100, label: "Making the thumbnail." },
];

type Picked = { file: File; url: string };
type FileFacts = { sha256: string; durationSec: number; thumbnail: string | null };
type Field = "title" | "category" | "price" | "rights";

async function sha256Hex(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Reads the duration and grabs a frame near 1 second as a JPEG thumbnail. */
function readVideo(url: string): Promise<{ durationSec: number; thumbnail: string | null }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    let settled = false;
    const duration = () => (Number.isFinite(video.duration) ? video.duration : 0);
    const finish = (thumbnail: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ durationSec: duration(), thumbnail });
    };
    const timer = setTimeout(() => finish(null), 10_000);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, duration() / 2 || 0);
    };
    video.onseeked = () => {
      try {
        const w = Math.min(640, video.videoWidth || 640);
        const h = video.videoWidth ? Math.round((w * video.videoHeight) / video.videoWidth) : 360;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(video, 0, 0, w, h);
        finish(canvas.toDataURL("image/jpeg", 0.75));
      } catch {
        finish(null);
      }
    };
    video.onerror = () => finish(null);
    video.src = url;
  });
}

const titleFromFileName = (name: string) =>
  name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

const nairaInput = (n: number) => (n ? n.toLocaleString("en-NG") : "");

export function UploadView() {
  const user = useRequireUser("/upload");
  if (!user) return <Loading label="Checking your account" />;
  return <UploadFlow />;
}

function UploadFlow() {
  const [createVideo] = useCreateVideoMutation();
  const [picked, setPicked] = useState<Picked | null>(null);
  const facts = useRef<Promise<FileFacts> | null>(null);
  const [step, setStep] = useState<"file" | "edit" | "done">("file");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [price, setPrice] = useState(SUGGESTED_BASE_KOBO / 100);
  const [rights, setRights] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, boolean>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [created, setCreated] = useState<Video | null>(null);

  // Let go of the local preview when the file changes or the page closes
  useEffect(() => () => void (picked && URL.revokeObjectURL(picked.url)), [picked]);

  function pick(file: File) {
    const url = URL.createObjectURL(file);
    facts.current = Promise.all([sha256Hex(file), readVideo(url)]).then(([sha256, meta]) => ({ sha256, ...meta }));
    setPicked({ file, url });
    if (!title.trim()) setTitle(titleFromFileName(file.name));
    setStep("edit");
    scrollTo({ top: 0 });
  }

  function reset() {
    setPicked(null);
    facts.current = null;
    setTitle("");
    setDescription("");
    setCategory(null);
    setPrice(SUGGESTED_BASE_KOBO / 100);
    setRights(false);
    setErrors({});
    setFormError(null);
    setCreated(null);
    setProgress(0);
    setStep("file");
  }

  async function publish() {
    if (!picked || !facts.current || !category) return;
    setFormError(null);
    const known = await facts.current.catch(() => null);
    if (!known || !(known.durationSec > 0)) {
      setFormError("We couldn’t read this video’s length. Export it as an MP4 and try again.");
      return;
    }
    setStep("done");
    setProgress(0);
    scrollTo({ top: 0 });

    // Simulated progress. TODO(Eradiri): swap for real upload progress (XHR upload.onprogress or the
    // storage SDK), then poll the processing job for the watermarked preview and thumbnail stages.
    let ticker: ReturnType<typeof setInterval> | undefined;
    const ticking = new Promise<void>((resolve) => {
      let p = 0;
      ticker = setInterval(() => {
        p = Math.min(100, p + 2 + Math.random() * 3);
        setProgress(p);
        if (p >= 100) {
          clearInterval(ticker);
          setTimeout(resolve, 400);
        }
      }, 90);
    });

    try {
      const f = await facts.current;
      const [{ video }] = await Promise.all([
        createVideo({
          title: title.trim(),
          description: description.trim(),
          category,
          basePriceKobo: price * 100,
          rightsConfirmed: rights,
          fileName: picked.file.name,
          fileSizeBytes: picked.file.size,
          fileSha256: f.sha256,
          durationSec: f.durationSec,
          thumbnailDataUrl: f.thumbnail,
        }).unwrap(),
        ticking,
      ]);
      setCreated(video);
    } catch (e) {
      clearInterval(ticker);
      setStep("edit");
      setFormError(errorMessage(e, "Publishing failed. Check your connection and try again."));
    }
  }

  if (step === "file") return <DropStep onPick={pick} />;

  if (step === "done" && picked)
    return (
      <section className="done">
        <video src={picked.url} muted loop autoPlay playsInline aria-label={title} />
        <div className="stage" aria-live="polite">
          {created ? (
            <>
              <h2>Your video is live</h2>
              <p>People can find “{created.title}” on Browse and license it now.</p>
              <div className="actions">
                <Link className="btn btn-ink" href={`/videos/${created.id}`}>
                  View your video
                </Link>
                <button className="btn btn-ghost" type="button" onClick={reset}>
                  Upload another
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Publishing your video</h2>
              <p>{STAGES.find((s) => progress <= s.until)?.label}</p>
              <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(progress)} aria-label="Publishing">
                <span style={{ width: `${progress}%` }} />
              </div>
              <p className="pct">{Math.floor(progress)}%</p>
            </>
          )}
        </div>
      </section>
    );

  if (!picked) return null;

  const validate = () => {
    const bad: Partial<Record<Field, boolean>> = {
      title: !title.trim(),
      category: !category,
      price: price * 100 < MIN_BASE_KOBO,
      rights: !rights,
    };
    setErrors(bad);
    const first = (Object.keys(bad) as Field[]).find((k) => bad[k]);
    if (first) document.querySelector(`[data-f="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return !first;
  };
  const clear = (f: Field) => errors[f] && setErrors((e) => ({ ...e, [f]: false }));

  return (
    <section>
      <h1 className="page-title">Add the details</h1>
      <div className="edit">
        <div className="preview">
          <video
            src={picked.url}
            muted
            loop
            autoPlay
            playsInline
            title="Click to pause or play"
            onClick={(e) => {
              const v = e.currentTarget;
              void (v.paused ? v.play().catch(() => {}) : v.pause());
            }}
          />
          <p className="file">
            <b>{picked.file.name}</b>
            <span>{formatBytes(picked.file.size)}</span>
            <button type="button" onClick={() => setStep("file")}>
              Replace
            </button>
          </p>
        </div>

        <form
          className="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (validate()) void publish();
          }}
        >
          <div className={`f${errors.title ? " has-err" : ""}`} data-f="title">
            <label htmlFor="title">Title</label>
            <input
              className="input"
              id="title"
              maxLength={120}
              placeholder="When the light comes back at 3am"
              autoComplete="off"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clear("title");
              }}
            />
            {errors.title && <p className="ferr">Add a title.</p>}
          </div>

          <div className="f">
            <label htmlFor="desc">
              Description <span className="opt">(optional)</span>
            </label>
            <textarea className="area" id="desc" rows={3} placeholder="What happens in the video." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className={`f${errors.category ? " has-err" : ""}`} data-f="category">
            <span className="lbl" id="cat-l">
              Category
            </span>
            <div className="cats" role="radiogroup" aria-labelledby="cat-l">
              {CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICONS[c];
                return (
                  <button
                    key={c}
                    type="button"
                    className="cat"
                    role="radio"
                    aria-checked={category === c}
                    onClick={() => {
                      setCategory(c);
                      clear("category");
                    }}
                  >
                    <Icon aria-hidden />
                    {c}
                  </button>
                );
              })}
            </div>
            {errors.category && <p className="ferr">Pick a category.</p>}
          </div>

          <div className={`f${errors.price ? " has-err" : ""}`} data-f="price">
            <label htmlFor="price">Your price</label>
            <div className="money">
              <span aria-hidden>₦</span>
              <input
                className="input"
                id="price"
                inputMode="numeric"
                autoComplete="off"
                value={nairaInput(price)}
                onChange={(e) => {
                  setPrice(Math.min(10_000_000, parseInt(e.target.value.replace(/\D/g, ""), 10) || 0));
                  clear("price");
                }}
              />
            </div>
            <p className="help">For the whole video for a month. You keep 85% of every sale.</p>
            {errors.price && <p className="ferr">Set a price of at least ₦1,000.</p>}
          </div>

          <div className={`f${errors.rights ? " has-err" : ""}`} data-f="rights">
            <label className="check">
              <input
                type="checkbox"
                checked={rights}
                onChange={(e) => {
                  setRights(e.target.checked);
                  clear("rights");
                }}
              />
              <span>I made this video and have the rights to everything in it, including any music and the people in it.</span>
            </label>
            {errors.rights && <p className="ferr">Tick this to confirm.</p>}
          </div>

          {formError && (
            <p className="form-err" role="alert">
              {formError}
            </p>
          )}
          <button className="btn btn-ink" type="submit">
            Publish video
          </button>
        </form>
      </div>
    </section>
  );
}

function DropStep({ onPick }: { onPick: (file: File) => void }) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const take = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) return setError("That isn’t a video. Choose an MP4 file.");
    if (file.size > MAX_BYTES) return setError(`This file is ${formatBytes(file.size)}. Videos can be up to 200 MB.`);
    setError(null);
    onPick(file);
  };

  return (
    <section>
      <h1 className="page-title">Upload a video</h1>
      <label
        className={`drop${over ? " is-over" : ""}`}
        onDragEnter={(e) => (e.preventDefault(), setOver(true))}
        onDragOver={(e) => (e.preventDefault(), setOver(true))}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files[0]);
        }}
      >
        <input type="file" accept="video/mp4,video/quicktime,video/*" aria-label="Choose a video file" onChange={(e) => take(e.target.files?.[0])} />
        <div>
          <div className="drop-icon">
            <Upload aria-hidden />
          </div>
          <h2>Drag your video here</h2>
          <p className="hint">MP4, up to 200 MB</p>
          <span className="btn btn-ink">Choose a file</span>
          {error && (
            <p className="err" role="alert">
              {error}
            </p>
          )}
        </div>
      </label>
    </section>
  );
}
