import { connection, type NextRequest } from "next/server";
import { db, effectiveStatus } from "@/lib/mock/db";
import { fail, json, sessionUser } from "@/lib/mock/http";
import { normaliseLicenceNumber } from "@/lib/pricing";
import type { DownloadLink } from "@/lib/types";

type Ctx = { params: Promise<{ number: string }> };

// GET /api/licences/:number/download  Short-lived link to the clean original file.
// Only the buyer of an active licence gets one. The real backend returns a signed storage URL.
export async function GET(req: NextRequest, { params }: Ctx) {
  await connection();
  const { number } = await params;
  const user = sessionUser(req);
  if (!user) return fail(401, "Log in to download.");
  const licence = db().licences.find((l) => l.licenceNumber === normaliseLicenceNumber(number));
  if (!licence || licence.buyerId !== user.id) return fail(404, "No licence with that number.");
  if (effectiveStatus(licence) !== "active") return fail(403, "This licence isn't active, so the file can't be downloaded.");
  const video = db().videos.find((v) => v.id === licence.videoId)!;
  const link: DownloadLink = {
    url: `${video.originalFileUrl}?licence=${licence.licenceNumber}&token=mock`,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
  return json(link);
}
