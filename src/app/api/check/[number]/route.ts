import { connection, type NextRequest } from "next/server";
import { db, effectiveStatus, videoSummary } from "@/lib/mock/db";
import { json } from "@/lib/mock/http";
import { normaliseLicenceNumber } from "@/lib/pricing";
import type { LicenceCheck } from "@/lib/types";

type Ctx = { params: Promise<{ number: string }> };

// GET /api/check/:number  Public. Anyone can confirm a licence is real.
// Pending (unpaid) licences are treated as not found.
export async function GET(_req: NextRequest, { params }: Ctx) {
  await connection();
  const { number } = await params;
  const d = db();
  const l = d.licences.find((x) => x.licenceNumber === normaliseLicenceNumber(number));
  const status = l ? effectiveStatus(l) : null;
  if (!l || status === "pending") {
    const res: LicenceCheck = { status: "not_found", licence: null };
    return json(res);
  }
  const v = d.videos.find((x) => x.id === l.videoId)!;
  const creator = d.users.find((u) => u.id === v.creatorId)!;
  const buyer = d.users.find((u) => u.id === l.buyerId)!;
  const res: LicenceCheck = {
    status: status === "active" ? "valid" : "expired",
    licence: {
      licenceNumber: l.licenceNumber,
      video: videoSummary(v),
      creator: { name: creator.name, verified: creator.verified },
      buyer: { name: buyer.name, businessName: buyer.businessName },
      part: l.part,
      duration: l.duration,
      startsAt: l.startsAt,
      endsAt: l.endsAt,
    },
  };
  return json(res);
}
