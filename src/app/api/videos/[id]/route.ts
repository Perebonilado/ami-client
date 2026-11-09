import { connection, type NextRequest } from "next/server";
import { db, toVideo } from "@/lib/mock/db";
import { body, fail, json, sessionUser } from "@/lib/mock/http";
import type { UpdateVideoInput } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  await connection();
  const { id } = await params;
  const v = db().videos.find((x) => x.id === id);
  const user = sessionUser(req);
  const canSeeHidden = user && (user.isAdmin || user.id === v?.creatorId);
  if (!v || (v.status !== "live" && !canSeeHidden)) return fail(404, "This video isn't available.");
  return json({ video: toVideo(v) });
}

// PATCH /api/videos/:id  Creator edits title, description, prices, or hides/unhides.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const user = sessionUser(req);
  if (!user) return fail(401, "Log in to edit this video.");
  const v = db().videos.find((x) => x.id === id);
  if (!v) return fail(404, "This video isn't available.");
  if (v.creatorId !== user.id) return fail(403, "Only the creator can edit this video.");
  const input = await body<UpdateVideoInput>(req);

  if (input.title !== undefined) {
    if (!input.title.trim()) return fail(400, "The title can't be empty.");
    v.title = input.title.trim();
  }
  if (input.description !== undefined) v.description = input.description.trim();
  if (input.status) {
    if (v.status === "under_review") return fail(409, "This video is under review by the Àmì team.");
    v.status = input.status;
  }
  if (input.prices) {
    if (!input.prices.some((p) => p.enabled && p.basePriceKobo > 0)) return fail(400, "Keep at least one licence type switched on.");
    for (const p of input.prices) {
      const row = db().prices.find((r) => r.videoId === id && r.useType === p.useType);
      if (row) {
        row.basePriceKobo = Math.max(0, Math.round(p.basePriceKobo));
        row.enabled = !!p.enabled;
      }
    }
  }
  return json({ video: toVideo(v) });
}
