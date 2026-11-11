import type { NextRequest } from "next/server";
import { db, newId, uniqueLicenceNumber } from "@/lib/mock/db";
import { body, fail, json, sessionUser } from "@/lib/mock/http";
import { DURATIONS, cleanPart, licencePriceKobo, splitPrice } from "@/lib/pricing";
import type { CheckoutInput, CheckoutResult } from "@/lib/types";

// POST /api/checkout  { videoId, part: { startSec, endSec } | null, duration }
// Creates a pending licence and a payment, then returns where to pay.
// The price is always worked out here, never trusted from the browser.
// The licence only becomes active when the payment is confirmed (webhook or callback).
export async function POST(req: NextRequest) {
  const user = sessionUser(req);
  if (!user) return fail(401, "Log in to license this video.");
  const input = await body<CheckoutInput>(req);
  const d = db();

  const video = d.videos.find((v) => v.id === input.videoId);
  if (!video || video.status !== "live") return fail(404, "This video isn't available to license.");
  if (video.creatorId === user.id) return fail(403, "You can't license your own video.");
  if (!DURATIONS.some((x) => x.value === input.duration)) return fail(400, "Choose how long you need the licence.");
  const part = cleanPart(input.part, video.durationSec);
  if (typeof part === "string") return fail(400, part);

  const priceKobo = licencePriceKobo(video.basePriceKobo, video.durationSec, part, input.duration!);
  const { platformFeeKobo, creatorShareKobo } = splitPrice(priceKobo);
  const licenceId = newId("l");
  const licenceNumber = uniqueLicenceNumber();
  d.licences.push({
    id: licenceId,
    licenceNumber,
    videoId: video.id,
    buyerId: user.id,
    part,
    duration: input.duration!,
    startsAt: null,
    endsAt: null,
    priceKobo,
    platformFeeKobo,
    creatorShareKobo,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  const reference = `SBX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  d.payments.push({ id: newId("p"), licenceId, reference, amountKobo: priceKobo, status: "initiated", paidAt: null });

  // With the Access Bank sandbox this becomes the bank's hosted checkout URL,
  // which sends the buyer back to /pay/:reference when they're done.
  const result: CheckoutResult = { licenceNumber, paymentReference: reference, amountKobo: priceKobo, paymentUrl: `/pay/${reference}` };
  return json(result, { status: 201 });
}
