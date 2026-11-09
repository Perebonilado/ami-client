import type { NextRequest } from "next/server";
import { db, toVideo } from "@/lib/mock/db";
import { body, fail, json, sessionUser } from "@/lib/mock/http";
import type { VideoStatus } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/videos/:id  { status: "live" | "hidden" | "under_review" }
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const admin = sessionUser(req);
  if (!admin?.isAdmin) return fail(403, "Only the Àmì team can do this.");
  const video = db().videos.find((v) => v.id === id);
  if (!video) return fail(404, "No such video.");
  const { status } = await body<{ status: VideoStatus }>(req);
  if (!status || !["live", "hidden", "under_review"].includes(status)) return fail(400, "Pick a valid status.");
  video.status = status;
  return json({ video: toVideo(video) });
}
