import { connection, type NextRequest } from "next/server";
import { db, toLicence } from "@/lib/mock/db";
import { fail, json, sessionUser } from "@/lib/mock/http";
import { normaliseLicenceNumber } from "@/lib/pricing";

type Ctx = { params: Promise<{ number: string }> };

// GET /api/licences/:number  Full licence for the buyer, the video's creator or an admin.
export async function GET(req: NextRequest, { params }: Ctx) {
  await connection();
  const { number } = await params;
  const user = sessionUser(req);
  if (!user) return fail(401, "Log in to see this licence.");
  const licence = db().licences.find((l) => l.licenceNumber === normaliseLicenceNumber(number));
  if (!licence) return fail(404, "No licence with that number.");
  const video = db().videos.find((v) => v.id === licence.videoId)!;
  if (licence.buyerId !== user.id && video.creatorId !== user.id && !user.isAdmin) {
    return fail(404, "No licence with that number.");
  }
  return json({ licence: toLicence(licence) });
}
