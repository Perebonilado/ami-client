import type { NextRequest } from "next/server";
import { db, newId, toVideo } from "@/lib/mock/db";
import { body, fail, json, sessionUser } from "@/lib/mock/http";
import { CATEGORIES, MIN_BASE_KOBO } from "@/lib/pricing";
import type { CreateVideoInput, Poster } from "@/lib/types";

const STOP = new Set(["the", "and", "for", "with", "her", "his", "their", "that", "this", "from", "who", "are", "was", "someone", "video", "videos", "clip", "clips"]);

// GET /api/videos?q=&category=  Public browse: live videos only.
// Without a search, newest first. With one, best match first. People can type a creator, a title,
// or describe a moment ("bride dancing at a wedding"); the real backend swaps this word matching
// for vector search over the videos themselves.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const category = req.nextUrl.searchParams.get("category") ?? "";
  const words = q.split(/[^a-z0-9₦]+/).filter((w) => w.length > 2 && !STOP.has(w));
  const d = db();
  const scored = d.videos
    .filter((v) => v.status === "live")
    .filter((v) => !category || v.category === category)
    .map((v) => {
      const creator = d.users.find((u) => u.id === v.creatorId);
      const haystack = [v.title, v.description, v.category, creator?.name ?? "", creator?.businessName ?? "", ...v.tags].join(" ").toLowerCase();
      const hits = words.filter((w) => haystack.includes(w)).length;
      return { v, hits };
    })
    .filter(({ hits }) => !words.length || hits >= Math.ceil(words.length / 2))
    .sort((a, b) => b.hits - a.hits || b.v.createdAt.localeCompare(a.v.createdAt));
  return json({ videos: scored.map(({ v }) => toVideo(v)) });
}

const POSTERS: Poster[] = [
  { from: "#E2552D", to: "#F2C14E" },
  { from: "#1A141F", to: "#5B3A6E" },
  { from: "#1F5E45", to: "#C9D66B" },
  { from: "#2E2A7A", to: "#E2552D" },
];

// POST /api/videos  Publish a video. The real backend also stores the file,
// makes the watermarked preview and thumbnail; the mock fakes those steps.
export async function POST(req: NextRequest) {
  const user = sessionUser(req);
  if (!user) return fail(401, "Log in to upload a video.");
  const input = await body<CreateVideoInput>(req);

  if (!input.title?.trim()) return fail(400, "Add a title.");
  if (!input.category || !CATEGORIES.includes(input.category as (typeof CATEGORIES)[number])) return fail(400, "Pick a category.");
  if (!input.rightsConfirmed) return fail(400, "Confirm you made the video and have the rights to it.");
  if (!input.fileSha256) return fail(400, "Add a video file.");
  if ((input.fileSizeBytes ?? 0) > 200 * 1024 * 1024) return fail(413, "Videos can be up to 200 MB.");
  const base = Math.round(input.basePriceKobo ?? 0);
  if (base < MIN_BASE_KOBO) return fail(400, "Set a price of at least ₦1,000.");

  const d = db();
  const dupe = d.videos.find((v) => v.fileSha256 === input.fileSha256);
  if (dupe) return fail(409, `This exact file is already on Àmì (${dupe.title}).`);

  const id = newId("v");
  // Dummy preview for demo uploads: the mock can't store the file itself.
  const sample = `/samples/sample-${(d.videos.length % 3) + 1}.mp4`;
  d.videos.push({
    id,
    creatorId: user.id,
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    category: input.category,
    tags: (input.tags ?? []).map((t) => t.trim().replace(/^#/, "").toLowerCase()).filter(Boolean).slice(0, 10),
    originalFileUrl: sample,
    previewUrl: sample,
    thumbnailUrl: input.thumbnailDataUrl ?? null,
    poster: POSTERS[d.videos.length % POSTERS.length],
    durationSec: Math.max(1, Math.round(input.durationSec ?? 0)),
    fileSha256: input.fileSha256,
    status: "live",
    createdAt: new Date().toISOString(),
    basePriceKobo: base,
  });
  return json({ video: toVideo(d.videos.find((v) => v.id === id)!) }, { status: 201 });
}
