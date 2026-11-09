import type { NextRequest } from "next/server";
import { db, newId, toVideo } from "@/lib/mock/db";
import { body, fail, json, sessionUser } from "@/lib/mock/http";
import { USE_TYPES } from "@/lib/pricing";
import type { CreateVideoInput, Poster } from "@/lib/types";

// GET /api/videos?q=&category=  Public browse: live videos only, newest first.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const category = req.nextUrl.searchParams.get("category") ?? "";
  const d = db();
  const videos = d.videos
    .filter((v) => v.status === "live")
    .filter((v) => !category || v.category === category)
    .filter((v) => {
      if (!q) return true;
      const creator = d.users.find((u) => u.id === v.creatorId);
      const haystack = [v.title, creator?.name ?? "", creator?.businessName ?? "", ...v.tags].join(" ").toLowerCase();
      return haystack.includes(q.replace(/^#/, ""));
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toVideo);
  return json({ videos });
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

  if (!input.title?.trim()) return fail(400, "Give your video a title.");
  if (!input.category) return fail(400, "Pick a category.");
  if (!input.declarations?.ownsVideo || !input.declarations?.hasRights) {
    return fail(400, "Confirm both declarations before publishing.");
  }
  if (!input.fileSha256) return fail(400, "Add a video file.");
  if ((input.fileSizeBytes ?? 0) > 200 * 1024 * 1024) return fail(413, "Videos can be up to 200 MB for now.");
  const prices = (input.prices ?? []).filter((p) => USE_TYPES.some((u) => u.value === p.useType));
  if (!prices.some((p) => p.enabled && p.basePriceKobo > 0)) return fail(400, "Offer at least one licence type with a price.");

  const d = db();
  const dupe = d.videos.find((v) => v.fileSha256 === input.fileSha256);
  if (dupe) return fail(409, `This exact file is already registered on Àmì (${dupe.title}).`);

  const id = newId("v");
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
    durationSec: Math.round(input.durationSec ?? 0),
    fileSha256: input.fileSha256,
    status: "live",
    createdAt: new Date().toISOString(),
  });
  for (const p of prices) {
    d.prices.push({ videoId: id, useType: p.useType, basePriceKobo: Math.max(0, Math.round(p.basePriceKobo)), enabled: !!p.enabled });
  }
  return json({ video: toVideo(d.videos.find((v) => v.id === id)!) }, { status: 201 });
}
