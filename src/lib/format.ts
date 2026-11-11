const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** 1_000_000 kobo → "₦10,000" */
export function formatNaira(kobo: number) {
  return naira.format(Math.round(kobo / 100)).replace("NGN", "₦").replace(/\s/g, "");
}

export function formatDate(iso: string | null, fallback = "—") {
  if (!iso) return fallback;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function handle(h: string) {
  return h.startsWith("@") ? h : `@${h}`;
}

export function shortHash(sha: string) {
  return `${sha.slice(0, 8)}…${sha.slice(-6)}`;
}

/** "12 seconds" */
export function formatSeconds(n: number) {
  return `${n} second${n === 1 ? "" : "s"}`;
}

/** "0:04 – 0:14" for part of a video, "Whole video" when there's no part. */
export function formatPart(part: { startSec: number; endSec: number } | null) {
  return part ? `${formatDuration(part.startSec)} – ${formatDuration(part.endSec)}` : "Whole video";
}
